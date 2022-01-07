import View from '@ioc:Adonis/Core/View'
import Logger from '@ioc:Adonis/Core/Logger'
import Database from '@ioc:Adonis/Lucid/Database'
import ProjectInput from 'App/Interfaces/ProjectInput'
import HelperService from 'App/Services/HelperService'

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
    const adminClient = Database.connection('admin')
    await adminClient.raw(`CREATE DATABASE IF NOT EXISTS ${database}`)
    try {
      await adminClient.raw(
        `CREATE USER IF NOT EXISTS '${user}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${password}'`
      )
    } catch (_) {
      await adminClient.raw(
        `CREATE USER IF NOT EXISTS '${user}'@'localhost' IDENTIFIED BY '${password}'`
      )
    }
    await adminClient.raw(`GRANT ALL PRIVILEGES ON ${database}.* TO '${user}'@'localhost'`)
    await adminClient.raw(`FLUSH PRIVILEGES`)
  }

  protected async prepareNginxConfig() {
    const api = await View.render(`stubs/hosting/nginx/api`, { input: this.input })
    const ui = await View.render(`stubs/hosting/nginx/ui`, { input: this.input })
    await HelperService.writeFile(`~/nginx/api-${this.input.id}`, api)
    await HelperService.writeFile(`~/nginx/ui-${this.input.id}`, ui)

    await HelperService.execute('sudo', [
      'ln',
      '-s',
      `~/nginx/api-${this.input.id}`,
      `/etc/nginx-sites-enabled/${this.input.id}-api`,
    ])

    await HelperService.execute('sudo', [
      'ln',
      '-s',
      `~/nginx/ui-${this.input.id}`,
      `/etc/nginx-sites-enabled/${this.input.id}-ui`,
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
    await this.createDatabaseAndUser()
    await this.buildAndHost()
  }

  public async init() {
    await this.start()
  }
}
