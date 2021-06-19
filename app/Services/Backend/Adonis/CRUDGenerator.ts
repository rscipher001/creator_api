// import os from 'os'
import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'
import mkdirp from 'mkdirp'

export default class CRUDGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  // Create app/Models/{Auth}.ts
  protected async createModel(i: number) {
    const table = this.input.tables[i]
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
    const namePart = `${table.names.camelCasePlural}.ts`
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

  // Create Validators
  protected async createValidators(i: number) {
    const table = this.input.tables[i]
    // Store and storeMany
    if (table.operations.includes('store')) {
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

    if (table.operations.includes('update')) {
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
      await HelperService.execute('npm', ['run', 'format'], { cwd: this.input.path })
      await HelperService.commit(
        `CRUD Added for ${this.input.tables[i].names.pascalCase}`,
        this.input.path
      )
    }
  }

  public async init() {
    await this.start()
  }
}