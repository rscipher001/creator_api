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

  protected async prepareNginxConfig() {
    await mkdirp(`${HOME}/nginx`)
    const api = await View.render(`stubs/hosting/nginx/api`, {
      input: this.input,
      uiDomain: Env.get('HOSTING_UI_DOMAIN'),
      apiDomain: Env.get('HOSTING_API_DOMAIN'),
      nginxApiPort: HostingPorts.nginxApi,
      nodeApiPort: HostingPorts.nodeApi,
    })
    const ui = await View.render(`stubs/hosting/nginx/ui`, {
      input: this.input,
      uiDomain: Env.get('HOSTING_UI_DOMAIN'),
      apiDomain: Env.get('HOSTING_API_DOMAIN'),
      nginxUiPort: HostingPorts.nodeApi,
    })
    await HelperService.writeFile(`${HOME}/nginx/api-${this.input.id}`, api)
    await HelperService.writeFile(`${HOME}/nginx/ui-${this.input.id}`, ui)

    await HelperService.execute('sudo', [
      'ln',
      '-s',
      `${HOME}/nginx/api-${this.input.id}`,
      `/etc/nginx/sites-enabled/${this.input.id}-api`,
    ])

    await HelperService.execute('sudo', [
      'ln',
      '-s',
      `${HOME}/nginx/ui-${this.input.id}`,
      `/etc/nginx/sites-enabled/${this.input.id}-ui`,
    ])
    await HelperService.execute('sudo', ['nginx', '-s', 'reload'])
  }

  protected async buildAndHost() {
    try {
      this.prepareNginxConfig()
    } catch (e) {
      Logger.error(e.mesage)
      console.error(e)
    }

    await this.updateApiDotEnvPort()

    // Run migration
    await HelperService.execute('node', ['ace', 'migration:run', '--env=production', '--force'], {
      cwd: this.input.path,
    })

    // Build Backend
    await HelperService.execute('npm', ['run', 'build'], {
      cwd: this.input.path,
    })

    // Build Frontend
    await HelperService.execute('npm', ['run', 'build'], {
      cwd: this.input.spaPath,
    })

    // Run PM2
    await HelperService.execute('pm2', ['start', 'server.js', '--name', `api-${this.input.id}`], {
      cwd: `${this.input.path}/build`,
    })
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

  protected async installDependencies() {
    await HelperService.execute('npm', ['ci'], { cwd: this.input.path })
    await HelperService.execute('npm', ['ci'], { cwd: this.input.spaPath })
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
    await HelperService.execute('pm2', ['stop', 'server.js', '--name', `api-${this.input.id}`])
    await HelperService.execute('pm2', ['delete', 'server.js', '--name', `api-${this.input.id}`])

    await HelperService.execute(`sudo`, ['rm', `${HOME}/nginx/api-${this.input.id}`])
    await HelperService.execute(`sudo`, ['rm', `${HOME}/nginx/ui-${this.input.id}`])
    await HelperService.execute('sudo', ['rm', `/etc/nginx/sites-enabled/${this.input.id}-api`])
    await HelperService.execute('sudo', ['rm', `/etc/nginx/sites-enabled/${this.input.id}-ui`])
    await HelperService.execute('sudo', ['nginx', '-s', 'reload'])

    const { databaseName: database, databaseUser: user } = this.input.hosting
    await this.executeMySqlQuery(`FLUSH PRIVILEGES`)
    await this.executeMySqlQuery(`DROP DATABASE IF EXISTS ${database}`)
    await this.executeMySqlQuery(`DROP USER IF EXISTS '${user}'@'localhost'`)
    await this.executeMySqlQuery(`FLUSH PRIVILEGES`)

    await HelperService.execute('rm', ['-rf', `${this.input.path}/build`])
    await HelperService.execute('rm', ['-rf', `${this.input.path}/node_modules`])
    await HelperService.execute('rm', ['-rf', `${this.input.spaPath}/dist`])
    await HelperService.execute('rm', ['-rf', `${this.input.spaPath}/node_modules`])
  }
}
