import mkdirp from 'mkdirp'
import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput, { Table, RelationType } from 'App/Interfaces/ProjectInput'

export default class CRUDGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  // Create app/Models/{Model}.ts
  protected async createModel(i: number) {
    const table = this.input.tables[i]
    if (!table.generateModel) return
    const filePath = `${this.input.path}/app/Models/${table.names.pascalCase}.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Models/modelTs`,
        {
          isAuth: false,
          input: this.input,
          table,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create migration
  protected async createMigration(i: number) {
    const table = this.input.tables[i]
    if (!table.generateMigration) return
    const namePart = `${table.names.snakeCasePlural}.ts`
    const migrationsPath = `${this.input.path}/database/migrations`
    const migrationFileNames = await HelperService.readdir(migrationsPath)
    let fileExists = false
    if (migrationFileNames.length) {
      fileExists = !!migrationFileNames.find((fileName) => fileName.indexOf(namePart) !== -1)
    }
    if (!fileExists) {
      await HelperService.sleep(1000) // Ensure migrations get unique timestamps
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/database/migrations/migrationTs`,
        {
          isAuth: false,
          input: this.input,
          table,
        }
      )
      const timestamp = new Date().getTime()
      const filePath = `${this.input.path}/database/migrations/${timestamp}_${namePart}`
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create foreign key where relation is circular
  protected async createLazyMigration(table: Table) {
    const namePart = `add_foreign_keys_to_${table.names.snakeCasePlural}.ts`
    await HelperService.sleep(1000) // Ensure migrations get unique timestamps
    if (
      table.relations.find((relation) => relation.type === RelationType.belongsTo && relation.lazy)
    ) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/database/migrations/lazyMigrationTs`,
        {
          isAuth: false,
          input: this.input,
          table,
        }
      )
      const timestamp = new Date().getTime()
      const filePath = `${this.input.path}/database/migrations/${timestamp}_${namePart}`
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create Validators
  protected async createValidators(i: number) {
    const table = this.input.tables[i]
    // Store and storeMany
    if (table.operationsMap.store) {
      const filePath = `${this.input.path}/app/Validators/Store${table.names.pascalCase}Validator.ts`
      const fileExists = await HelperService.fileExists(filePath)
      if (!fileExists) {
        const content = await View.render(
          `stubs/backend/${this.input.tech.backend}/full/app/Validators/validatorTs`,
          {
            action: 'store',
            input: this.input,
            table,
          }
        )
        await HelperService.writeFile(filePath, content)
      }
    }

    if (table.operationsMap.update) {
      const filePath = `${this.input.path}/app/Validators/Update${table.names.pascalCase}Validator.ts`
      const fileExists = await HelperService.fileExists(filePath)
      if (!fileExists) {
        const content = await View.render(
          `stubs/backend/${this.input.tech.backend}/full/app/Validators/validatorTs`,
          {
            action: 'update',
            input: this.input,
            table,
          }
        )
        await HelperService.writeFile(filePath, content)
      }
    }
  }

  // Create Controller
  protected async createController(i: number) {
    const table = this.input.tables[i]
    if (!table.generateController) return
    if (this.input.types.includes('api')) {
      const filePath = `${this.input.path}/app/Controllers/Http/API/${table.names.pascalCasePlural}Controller.ts`
      const fileExists = await HelperService.fileExists(filePath)
      if (!fileExists) {
        const content = await View.render(
          `stubs/backend/${this.input.tech.backend}/full/app/Controllers/Http/API/controllerTs`,
          {
            input: this.input,
            table,
          }
        )
        await HelperService.writeFile(filePath, content)
      }
    }
  }

  // Add routes
  protected async addRoutes(i: number) {
    const table = this.input.tables[i]
    if (!table.generateController) return
    if (this.input.types.includes('api')) {
      const filePath = `${this.input.path}/start/routes.ts`
      let content = await HelperService.readFile(filePath)
      const part = await View.render(
        `stubs/backend/${this.input.tech.backend}/partials/crudGenerator/routesTs`,
        {
          table,
          type: 'api',
        }
      )
      content += part
      await HelperService.writeFile(filePath, content)
    }
  }

  /**
   * Steps
   * 1. Create Migration
   * 2. Create Model
   * 3. Create Validations
   * 4. Create Controller
   */
  protected async start() {
    await Promise.all([
      await mkdirp(`${this.input.path}/app/Models`),
      await mkdirp(`${this.input.path}/app/Validators`),
      await mkdirp(`${this.input.path}/database/migrations`),
      await mkdirp(`${this.input.path}/app/Controllers/Http/API/`),
    ])

    for (let i = 0; i < this.input.tables.length; i += 1) {
      await this.createMigration(i)
      await this.createModel(i)
      await this.createValidators(i)
      await this.createController(i)
      await this.addRoutes(i)
      await HelperService.commit(
        `CRUD Added for ${this.input.tables[i].names.pascalCase}`,
        this.input.path
      )
    }

    await this.createLazyMigration(this.input.auth.table)
    for (let i = 0; i < this.input.tables.length; i += 1) {
      await this.createLazyMigration(this.input.tables[i])
    }
  }

  public async init() {
    await this.start()
  }
}
