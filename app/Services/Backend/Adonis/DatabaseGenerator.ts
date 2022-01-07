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
    const filePath = `${this.input.path}/ace-manifest.json`
    const content = await HelperService.readJson(filePath)

    // No need to do any check since all of these are assignment not push in array
    content.commands['db:seed'] = {
      settings: {
        loadApp: true,
      },
      commandPath: '@adonisjs/lucid/build/commands/DbSeed',
      commandName: 'db:seed',
      description: 'Execute database seeder files',
      args: [],
      aliases: [],
      flags: [
        {
          name: 'connection',
          propertyName: 'connection',
          type: 'string',
          description: 'Define a custom database connection for the seeders',
          alias: 'c',
        },
        {
          name: 'interactive',
          propertyName: 'interactive',
          type: 'boolean',
          description: 'Run seeders in interactive mode',
          alias: 'i',
        },
        {
          name: 'files',
          propertyName: 'files',
          type: 'array',
          description: 'Define a custom set of seeders files names to run',
          alias: 'f',
        },
      ],
    }

    content.commands['make:model'] = {
      settings: {},
      commandPath: '@adonisjs/lucid/build/commands/MakeModel',
      commandName: 'make:model',
      description: 'Make a new Lucid model',
      args: [
        {
          type: 'string',
          propertyName: 'name',
          name: 'name',
          required: true,
          description: 'Name of the model class',
        },
      ],
      aliases: [],
      flags: [
        {
          name: 'migration',
          propertyName: 'migration',
          type: 'boolean',
          alias: 'm',
          description: 'Generate the migration for the model',
        },
        {
          name: 'controller',
          propertyName: 'controller',
          type: 'boolean',
          alias: 'c',
          description: 'Generate the controller for the model',
        },
      ],
    }

    content.commands['make:migration'] = {
      settings: {
        loadApp: true,
      },
      commandPath: '@adonisjs/lucid/build/commands/MakeMigration',
      commandName: 'make:migration',
      description: 'Make a new migration file',
      args: [
        {
          type: 'string',
          propertyName: 'name',
          name: 'name',
          required: true,
          description: 'Name of the migration file',
        },
      ],
      aliases: [],
      flags: [
        {
          name: 'connection',
          propertyName: 'connection',
          type: 'string',
          description: 'The connection flag is used to lookup the directory for the migration file',
        },
        {
          name: 'folder',
          propertyName: 'folder',
          type: 'string',
          description: 'Pre-select a migration directory',
        },
        {
          name: 'create',
          propertyName: 'create',
          type: 'string',
          description: 'Define the table name for creating a new table',
        },
        {
          name: 'table',
          propertyName: 'table',
          type: 'string',
          description: 'Define the table name for altering an existing table',
        },
      ],
    }

    content.commands['make:seeder'] = {
      settings: {},
      commandPath: '@adonisjs/lucid/build/commands/MakeSeeder',
      commandName: 'make:seeder',
      description: 'Make a new Seeder file',
      args: [
        {
          type: 'string',
          propertyName: 'name',
          name: 'name',
          required: true,
          description: 'Name of the seeder class',
        },
      ],
      aliases: [],
      flags: [],
    }

    content.commands['migration:run'] = {
      settings: {
        loadApp: true,
      },
      commandPath: '@adonisjs/lucid/build/commands/Migration/Run',
      commandName: 'migration:run',
      description: 'Run pending migrations',
      args: [],
      aliases: [],
      flags: [
        {
          name: 'connection',
          propertyName: 'connection',
          type: 'string',
          description: 'Define a custom database connection',
          alias: 'c',
        },
        {
          name: 'force',
          propertyName: 'force',
          type: 'boolean',
          description: 'Explicitly force to run migrations in production',
        },
        {
          name: 'dry-run',
          propertyName: 'dryRun',
          type: 'boolean',
          description: 'Print SQL queries, instead of running the migrations',
        },
      ],
    }

    content.commands['migration:rollback'] = {
      settings: {
        loadApp: true,
      },
      commandPath: '@adonisjs/lucid/build/commands/Migration/Rollback',
      commandName: 'migration:rollback',
      description: 'Rollback migrations to a given batch number',
      args: [],
      aliases: [],
      flags: [
        {
          name: 'connection',
          propertyName: 'connection',
          type: 'string',
          description: 'Define a custom database connection',
          alias: 'c',
        },
        {
          name: 'force',
          propertyName: 'force',
          type: 'boolean',
          description: 'Explictly force to run migrations in production',
        },
        {
          name: 'dry-run',
          propertyName: 'dryRun',
          type: 'boolean',
          description: 'Print SQL queries, instead of running the migrations',
        },
        {
          name: 'batch',
          propertyName: 'batch',
          type: 'number',
          description:
            'Define custom batch number for rollback. Use 0 to rollback to initial state',
        },
      ],
    }

    content.commands['migration:status'] = {
      settings: {
        loadApp: true,
      },
      commandPath: '@adonisjs/lucid/build/commands/Migration/Status',
      commandName: 'migration:status',
      description: 'Check migrations current status.',
      args: [],
      aliases: [],
      flags: [
        {
          name: 'connection',
          propertyName: 'connection',
          type: 'string',
          description: 'Define a custom database connection',
          alias: 'c',
        },
      ],
    }

    await HelperService.writeJson(filePath, content)
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
    const part = await View.render(
      `stubs/backend/${this.input.tech.backend}/partials/databaseGenerator/dotEnv`,
      {
        database,
        input: this.input,
      }
    )
    switch (database) {
      case Database.MySQL:
        if (content.indexOf('MYSQL_HOST') === -1) {
          content += part
          content += '\n'
          await HelperService.writeFile(filePath, content)
        }
        break
      case Database.PostgreSQL:
        if (content.indexOf('PG_HOST') === -1) {
          content += part
          content += '\n'
          await HelperService.writeFile(filePath, content)
        }
    }
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
   * 6. Install mysql and luxon
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

    // Install MySQL
    await HelperService.execute('npm', ['install', 'mysql', 'luxon'], {
      cwd: this.input.path,
    })
  }

  /**
   * Steps
   * 1. Install lucid
   * 2. Update common files related to database
   * 3. Install db specifc packabe and update files
   */
  protected async start() {
    // Install Lucid
    await HelperService.execute('npm', ['install', '@adonisjs/lucid'], {
      cwd: this.input.path,
    })

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
