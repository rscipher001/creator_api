import os from 'os'
import mkdirp from 'mkdirp'
import View from '@ioc:Adonis/Core/View'
import { Database } from 'App/Interfaces/Enums'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'

export default class DatabaseGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  // Create start/events.ts
  protected async createStartEventsTs() {
    const filePath = `${this.input.path}/start/events.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/start/eventsTs`
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create app/NamingStrategy/CamelCaseStrategy.ts
  protected async createAppNamingStrategyCamelCaseStrategyTs() {
    await mkdirp(`${this.input.path}/app/NamingStrategy`)
    const filePath = `${this.input.path}/app/NamingStrategy/CamelCaseStrategy.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/NamingStrategy/camelCaseStrategyTs`
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Update providers/AppProvider.ts
  protected async updateProvidersAppProviderTs() {
    const filePath = `${this.input.path}/providers/AppProvider.ts`
    const content = await View.render(
      `stubs/backend/${this.input.tech.backend}/full/providers/appProviderTs`
    )
    await HelperService.writeFile(filePath, content)
  }

  // Update .adonisrc.json
  protected async updateAdonisrcJson() {
    const filePath = `${this.input.path}/.adonisrc.json`
    const content = await HelperService.readJson(filePath)
    const command = '@adonisjs/lucid/build/commands'
    const provider = '@adonisjs/lucid'
    const preload = './start/events'
    if (!content.commands.includes(command)) content.commands.push(command)
    if (!content.providers.includes(provider)) content.providers.push(provider)
    if (!content.preloads.includes(preload)) content.preloads.push(preload)
    await HelperService.writeJson(filePath, content)
  }

  // Update ace-manifest.json
  protected async updateAceManifestJson() {
    await HelperService.execute('node', ['ace', 'generate:manifest'], {
      cwd: this.input.path,
    })
  }

  // Update tsconfig.json
  protected async updateTsconfigJson() {
    const filePath = `${this.input.path}/tsconfig.json`
    const content = await HelperService.readJson(filePath)
    const type = '@adonisjs/lucid'
    if (!content.compilerOptions.types.includes(type)) {
      content.compilerOptions.types.push(type)
      await HelperService.writeJson(filePath, content)
    }
  }

  // Update .env & .env.example
  protected async updateDotEnv(path = '.env') {
    const database = this.input.database
    const filePath = `${this.input.path}/${path}`
    let content = await HelperService.readFile(filePath)

    // The following code can be improved
    let connectName = 'mysql'
    switch (database) {
      case Database.MSSQL:
        connectName = 'mssql'
        break
      case Database.SQLite:
        connectName = 'sqlite'
        break
      case Database.PostgreSQL:
        connectName = 'pg'
        break
      case Database.MySQL:
        connectName = 'mysql'
        break
      case Database.OracleDB:
        connectName = 'oracledb'
        break
      default:
        connectName = 'mysql'
    }
    const part = await View.render(
      `stubs/backend/${this.input.tech.backend}/partials/databaseGenerator/dotEnv`,
      {
        database,
        connectName,
        input: this.input,
      }
    )
    content += part
    content += '\n'
    await HelperService.writeFile(filePath, content)
  }

  // Update env.ts
  protected async updateEnvTs() {
    const database = this.input.database
    const filePath = `${this.input.path}/env.ts`
    let content = await HelperService.readFile(filePath)

    // Can be improved
    const part = await View.render(
      `stubs/backend/${this.input.tech.backend}/partials/databaseGenerator/envTs`,
      { database }
    )
    switch (database) {
      case Database.MySQL:
        if (content.indexOf('MYSQL_HOST') === -1) {
          const envTsLines = content.split(os.EOL) // File to array by newLines
          // If last line ie empty and second last line is closing Env.rules with })
          if (envTsLines.slice(-1)[0] === '' && envTsLines.slice(-2)[0] === '})') {
            const envTsSqlContentLines = part.split(os.EOL)
            envTsSqlContentLines.forEach((newLine) => {
              envTsLines.splice(envTsLines.length - 2, 0, newLine)
            })
            await HelperService.writeFile(filePath, envTsLines.join('\n'))
          }
        }
        break
      case Database.PostgreSQL:
        if (content.indexOf('PG_HOST') === -1) {
          const envTsLines = content.split(os.EOL) // File to array by newLines
          // If last line ie empty and second last line is closing Env.rules with })
          if (envTsLines.slice(-1)[0] === '' && envTsLines.slice(-2)[0] === '})') {
            const envTsSqlContentLines = part.split(os.EOL)
            envTsSqlContentLines.forEach((newLine) => {
              envTsLines.splice(envTsLines.length - 2, 0, newLine)
            })
            await HelperService.writeFile(filePath, envTsLines.join('\n'))
          }
        }
    }
  }

  // Create config/dataabse.ts
  protected async createConfigDatabaseTs() {
    const database = this.input.database
    const filePath = `${this.input.path}/config/database.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/config/databaseTs`,
        { database }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create database/factories/index.ts
  protected async createDatabaseFactoryIndex() {
    const database = this.input.database
    const filePath = `${this.input.path}/database/factories/index.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/database/factories/indexTs`,
        { database }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  /**
   * Steps
   * 1. Update .env
   * 2. Update .env.example
   * 3. Update env.ts
   * 4. Update config/database.ts
   * 5. Copy database/factories/index.ts
   */
  protected async initMysql() {
    if (this.input.camelCaseStrategy) {
      await this.createAppNamingStrategyCamelCaseStrategyTs()
      await this.updateProvidersAppProviderTs()
    }
    await this.updateDotEnv('.env')
    await this.updateDotEnv('.env.example')
    await this.updateEnvTs()
    await this.createConfigDatabaseTs()
    await mkdirp(`${this.input.path}/database/factories`)

    // Copy database/factories/index.ts
    await this.createDatabaseFactoryIndex()
  }

  /**
   * Steps
   * 2. Update common files related to database
   * 3. Install db specifc packabe and update files
   */
  protected async start() {
    // Update common files related to database
    // 1. .adonisrc.json
    // 2. ace-manifest.json
    // 3. tsconfig.json
    await this.updateAdonisrcJson()
    await this.updateAceManifestJson()
    await this.updateTsconfigJson()
    await this.createStartEventsTs()

    switch (this.input.database) {
      case Database.MySQL:
        await this.initMysql()
    }

    await HelperService.commit('Database added', this.input.path)
  }

  public async init() {
    await this.start()
  }
}
