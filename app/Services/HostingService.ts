import mkdirp from 'mkdirp'
import Env from '@ioc:Adonis/Core/Env'
import View from '@ioc:Adonis/Core/View'
import Logger from '@ioc:Adonis/Core/Logger'
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
    const createDatabaseCommand = `mysql -uroot -p${Env.get('ROOT_MYSQL_PASSWORD')} -e`
    const [command, ...args] = createDatabaseCommand.split(' ')
    args.push(`${query}`)
    console.log(command, args)
    await HelperService.execute(command, args)
  }

  protected async prepareNginxConfig() {
    await mkdirp(`${HOME}/nginx`)
    const api = await View.render(`stubs/hosting/nginx/api`, { input: this.input })
    const ui = await View.render(`stubs/hosting/nginx/ui`, { input: this.input })
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

  /**
   * Create MySQL user & database
   * Create Nginx config file
   */
  protected async start() {
    // await this.createDatabaseAndUser()
    await this.buildAndHost()
  }

  public async init() {
    await this.start()
  }
}
