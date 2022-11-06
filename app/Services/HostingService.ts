import mkdirp from 'mkdirp'
import Env from '@ioc:Adonis/Core/Env'
import View from '@ioc:Adonis/Core/View'
import Logger from '@ioc:Adonis/Core/Logger'
import { HostingPorts } from 'App/Interfaces/Enums'
import ProjectInput from 'App/Interfaces/ProjectInput'
import HelperService from 'App/Services/HelperService'

const HOME = process.env.HOME

export default class HostingService {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  protected prepareEnv() {
    const keysToRemove = [
      'HOST',
      'PORT',
      'NODE_ENV',
      'APP_KEY',
      'CACHE_VIEWS',
      'DRIVE_DISK',
      'UI_URL',
      'DB_CONNECTION',
      'DB_DEBUG',
      'MYSQL_HOST',
      'MYSQL_PORT',
      'MYSQL_USER',
      'MYSQL_PASSWORD',
      'MYSQL_DB_NAME',
      'PROJECT_PATH',
      'MAIL_FROM_ADDRESS',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USERNAME',
      'SMTP_PASSWORD',
      'REDIS_CONNECTION',
      'REDIS_HOST',
      'REDIS_PORT',
      'REDIS_PASSWORD',
      'ENABLE_HOSTING',
      'HOSTING_UI_DOMAIN',
      'HOSTING_API_DOMAIN',
      'ROOT_MYSQL_HOST',
      'ROOT_MYSQL_PORT',
      'ROOT_MYSQL_PASSWORD',
    ]
    const env = JSON.parse(JSON.stringify(process.env))
    keysToRemove.forEach((key) => delete env[key])
    return {
      ...env,
      ...{
        NODE_ENV: 'development',
      },
    }
  }

  /**
   * Creates MySQL database and user for the project
   */
  protected async createDatabaseAndUser() {
    const {
      databaseName: database,
      databaseUser: user,
      databasePassword: password,
    } = this.input.hosting
    await this.executeMySqlQuery(`FLUSH PRIVILEGES`)
    await this.executeMySqlQuery(`CREATE DATABASE IF NOT EXISTS ${database}`)
    await this.executeMySqlQuery(
      `CREATE USER IF NOT EXISTS '${user}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${password}'`
    )
    await this.executeMySqlQuery(
      `CREATE USER IF NOT EXISTS '${user}'@'localhost' IDENTIFIED BY '${password}'`
    )
    await this.executeMySqlQuery(`GRANT ALL PRIVILEGES ON ${database}.* TO '${user}'@'localhost'`)
    await this.executeMySqlQuery(`FLUSH PRIVILEGES`)
  }

  protected async executeMySqlQuery(query) {
    const createDatabaseCommand = `sudo mysql -uroot -p${Env.get('ROOT_MYSQL_PASSWORD')} -e`
    const [command, ...args] = createDatabaseCommand.split(' ')
    args.push(`${query}`)
    await HelperService.execute(command, args)
  }

  /**
   * Creates ~/nginx folder, puts config in it and symlinks to /etc/nginx/sites-enabled
   */
  protected async prepareNginxConfig() {
    await mkdirp(`${HOME}/nginx`)
    const [api, ui] = await Promise.all([
      View.render(`stubs/hosting/nginx/api`, {
        input: this.input,
        uiDomain: Env.get('HOSTING_UI_DOMAIN'),
        apiDomain: Env.get('HOSTING_API_DOMAIN'),
        nginxApiPort: HostingPorts.nginxApi,
        nodeApiPort: HostingPorts.nodeApi,
      }),
      View.render(`stubs/hosting/nginx/ui`, {
        input: this.input,
        uiDomain: Env.get('HOSTING_UI_DOMAIN'),
        apiDomain: Env.get('HOSTING_API_DOMAIN'),
        nginxUiPort: HostingPorts.nginxUi,
      }),
    ])
    await Promise.all([
      HelperService.writeFile(`${HOME}/nginx/api-${this.input.id}`, api),
      HelperService.writeFile(`${HOME}/nginx/ui-${this.input.id}`, ui),
    ])

    await Promise.all([
      HelperService.execute('sudo', [
        'ln',
        '-s',
        `${HOME}/nginx/api-${this.input.id}`,
        `/etc/nginx/sites-enabled/${this.input.id}-api`,
      ]),
      HelperService.execute('sudo', [
        'ln',
        '-s',
        `${HOME}/nginx/ui-${this.input.id}`,
        `/etc/nginx/sites-enabled/${this.input.id}-ui`,
      ]),
    ])
    await HelperService.execute('sudo', ['nginx', '-s', 'reload'])
  }

  /**
   * Builds the projects
   * Configures nginx
   * Update .env files with correct ports
   * Configures PM2
   * Runs migrations
   */
  protected async buildAndHost() {
    const envForBuildCommand = this.prepareEnv()
    try {
      await this.prepareNginxConfig()
    } catch (e) {
      Logger.error(e.mesage)
      console.error(e)
    }

    await Promise.all([this.updateApiDotEnvPort(), this.updateUiDotEnvPort()])

    await Promise.all([
      HelperService.execute('npm', ['run', 'build'], {
        cwd: this.input.path,
        env: envForBuildCommand,
      }),
      HelperService.execute('npm', ['run', 'build'], {
        cwd: this.input.spaPath,
        env: envForBuildCommand,
      }),
    ])

    await HelperService.copyFile(`${this.input.path}/.env`, `${this.input.path}/build/.env`)

    // Run migration
    await HelperService.execute('node', ['ace', 'migration:run', '--force'], {
      cwd: this.input.path,
      env: envForBuildCommand,
    })

    // Run seeders
    if (this.input.rbac.enabled) {
      await HelperService.execute('node', ['ace', 'db:seed'], {
        cwd: this.input.path,
        env: envForBuildCommand,
      })
    }

    // Run PM2
    await HelperService.execute('pm2', ['start', 'server.js', '--name', `api-${this.input.id}`], {
      cwd: `${this.input.path}/build`,
      env: envForBuildCommand,
    })
    Logger.info(`${this.input.id} is hosted successfully`)
  }

  protected async updateApiDotEnvPort() {
    // Update API port in .env to ensure it runs on a unique port
    const filePath = `${this.input.path}/.env`
    let content = await HelperService.readFile(filePath)
    await HelperService.writeFile(
      filePath,
      content.replace('PORT=3333', `PORT=${HostingPorts.nodeApi + this.input.id}`)
    )
  }

  protected async updateUiDotEnvPort() {
    // Update UI port in .env to ensure it connects on correct port
    const filePath = `${this.input.spaPath}/.env.local`
    let content = await HelperService.readFile(filePath)
    await HelperService.writeFile(
      filePath,
      content.replace(
        'VUE_APP_API_URL=http://localhost:3333',
        `VUE_APP_API_URL=https://${Env.get('HOSTING_API_DOMAIN')}:${
          HostingPorts.nginxApi + this.input.id
        }`
      )
    )
  }

  /**
   * Run npm install in both SPA and API projects
   */
  protected async installDependencies() {
    const envForBuildCommand = this.prepareEnv()
    if (this.input.generate.spa.generate && this.input.generate.api.generate) {
      await Promise.all([
        HelperService.execute('npm', ['ci'], { cwd: this.input.path, env: envForBuildCommand }),
        HelperService.execute('npm', ['ci'], { cwd: this.input.spaPath, env: envForBuildCommand }),
      ])
    }
    if (this.input.generate.api.generate) {
      await HelperService.execute('npm', ['ci'], { cwd: this.input.path, env: envForBuildCommand })
    }
    if (this.input.generate.spa.generate) {
      await HelperService.execute('npm', ['ci'], {
        cwd: this.input.spaPath,
        env: envForBuildCommand,
      })
    }
  }

  protected async start() {
    await this.installDependencies()
    await this.createDatabaseAndUser()
    await this.buildAndHost()
  }

  public async init() {
    await this.start()
  }

  public async stop() {
    /**
     * 1. Stop and remove PM2 entry
     * 2. Remove Nginx config, symlinks and restart
     * 3. Remove MySQL user & database
     * 4. Remove build folders
     */
    await HelperService.execute('pm2', ['stop', `api-${this.input.id}`], { env: this.prepareEnv() })
    await HelperService.execute('pm2', ['delete', `api-${this.input.id}`], {
      env: this.prepareEnv(),
    })

    await Promise.allSettled([
      HelperService.execute(`sudo`, ['rm', `${HOME}/nginx/api-${this.input.id}`]),
      HelperService.execute(`sudo`, ['rm', `${HOME}/nginx/ui-${this.input.id}`]),
      HelperService.execute('sudo', ['rm', `/etc/nginx/sites-enabled/${this.input.id}-api`]),
      HelperService.execute('sudo', ['rm', `/etc/nginx/sites-enabled/${this.input.id}-ui`]),
    ])
    await HelperService.execute('sudo', ['nginx', '-s', 'reload'])

    const { databaseName: database, databaseUser: user } = this.input.hosting
    await this.executeMySqlQuery(`FLUSH PRIVILEGES`)
    await this.executeMySqlQuery(`DROP DATABASE IF EXISTS ${database}`)
    await this.executeMySqlQuery(`DROP USER IF EXISTS '${user}'@'localhost'`)
    await this.executeMySqlQuery(`FLUSH PRIVILEGES`)

    await Promise.allSettled([
      HelperService.execute('rm', ['-rf', `${this.input.path}/build`]),
      HelperService.execute('rm', ['-rf', `${this.input.path}/node_modules`]),
      HelperService.execute('rm', ['-rf', `${this.input.spaPath}/dist`]),
      HelperService.execute('rm', ['-rf', `${this.input.spaPath}/node_modules`]),
    ])
  }
}
