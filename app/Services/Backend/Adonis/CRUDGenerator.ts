import mkdirp from 'mkdirp'
import View from '@ioc:Adonis/Core/View'
import { ProjectType, RelationType } from 'App/Interfaces/Enums'
import HelperService from 'App/Services/HelperService'
import ProjectInput, { Table } from 'App/Interfaces/ProjectInput'

export default class CRUDGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  // Create app/Models/{Model}.ts
  protected async createModel(table) {
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
  protected async createMigration(table) {
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
      table.relations.find((relation) => relation.type === RelationType.BelongsTo && relation.lazy)
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
  protected async createValidators(table) {
    // Store and storeMany
    if (table.operations.store) {
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

    if (table.operations.storeMany) {
      const filePath = `${this.input.path}/app/Validators/StoreMany${table.names.pascalCase}Validator.ts`
      const fileExists = await HelperService.fileExists(filePath)
      if (!fileExists) {
        const content = await View.render(
          `stubs/backend/${this.input.tech.backend}/full/app/Validators/manyValidatorTs`,
          {
            input: this.input,
            table,
          }
        )
        await HelperService.writeFile(filePath, content)
      }
    }

    if (table.operations.update) {
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
  protected async createController(table) {
    if (!table.generateController) return

    // Get all roles from controller
    const permissions: string[] = []
    if (this.input.rbac.enabled) {
      this.input.rbac.permissions.forEach((p) => {
        if (p.name.startsWith(`${table.names.camelCase}`)) {
          permissions.push(p.name)
        }
      })
    }
    if (this.input.types.includes(ProjectType.API)) {
      const filePath = `${this.input.path}/app/Controllers/Http/API/${table.names.pascalCasePlural}Controller.ts`
      const fileExists = await HelperService.fileExists(filePath)
      if (!fileExists) {
        const content = await View.render(
          `stubs/backend/${this.input.tech.backend}/full/app/Controllers/Http/API/controllerTs`,
          {
            input: this.input,
            table,
            permissions,
          }
        )
        await HelperService.writeFile(filePath, content)
      }
    }
  }

  protected async generatePublicRoutes(table: Table) {
    if (this.input.types.includes(ProjectType.API)) {
      return View.render(
        `stubs/backend/${this.input.tech.backend}/partials/crudGenerator/crudRoutesTs`,
        {
          table,
          type: ProjectType.API,
        }
      )
    }
  }

  protected async generateAuthRoutes(table: Table) {
    return View.render(
      `stubs/backend/${this.input.tech.backend}/partials/crudGenerator/csvRoutesTs`,
      {
        table,
        type: ProjectType.API,
      }
    )
  }

  // Add routes
  protected async addRoutes() {
    const filePath = `${this.input.path}/start/routes.ts`
    let content = await HelperService.readFile(filePath)
    let apiAuthContent = ''
    let apiPublicContent = ''
    // Add auth table routes
    if (this.input.auth.table.generateRoute) {
      apiAuthContent += await this.generatePublicRoutes(this.input.auth.table)
      if (this.input.auth.table.operations.storeMany) {
        apiPublicContent += await this.generateAuthRoutes(this.input.auth.table)
      }
    }
    // Add other table routes
    for (let i = 0; i < this.input.tables.length; i += 1) {
      const table = this.input.tables[i]
      if (!table.generateRoute) continue
      apiAuthContent += await this.generatePublicRoutes(table)
      if (table.operations.storeMany) {
        apiPublicContent += await this.generateAuthRoutes(table)
      }
    }
    content += await View.render(
      `stubs/backend/${this.input.tech.backend}/partials/crudGenerator/routesTs`,
      {
        apiAuthContent,
        apiPublicContent,
      }
    )
    await HelperService.writeFile(filePath, content)
  }

  protected async createManyToManyMigrations() {
    // Store m2m tables as table1:table alphabetcally sorted
    // Unique them to remove duplicates and generate migrations
    const combos: string[] = []
    this.input.tables.forEach((table) => {
      table.relations
        .filter((r) => r.type === RelationType.ManyToMany)
        .forEach((relation) => {
          combos.push([table.name, relation.modelNames.pascalCase].sort().join(':'))
        })
    })
    await Promise.all([
      // Remove duplicates and process combos
      Array.from(new Set(combos)).map(async (combo) => {
        const [tableOne, tableTwo] = combo.split(':')
        const tableOneNames = HelperService.generateExtendedNames(tableOne)
        const tableTwoNames = HelperService.generateExtendedNames(tableTwo)
        const name = `${tableOneNames.pascalCase}${tableTwoNames.pascalCase}`
        const table: Table = {
          name,
          names: HelperService.generateExtendedNames(name),
          tableName: this.input.camelCaseStrategy
            ? `${tableOneNames.camelCase}${tableTwoNames.pascalCase}`
            : `${tableOneNames.snakeCase}_${tableTwoNames.snakeCase}`,
          generateController: false,
          generateModel: false,
          generateMigration: true,
          generateUI: false,
          generateRoute: false,
          singleton: false,
          routeParents: [],
          indexColumns: [],
          routeParentTables: [],
          operations: {
            index: false,
            create: false,
            store: false,
            show: true,
            edit: false,
            update: false,
            destroy: false,
            destroyMany: false,
            storeMany: false,
          },
          customOperations: [],
          columns: [],
          timestamps: false,
          relations: [
            {
              type: RelationType.BelongsTo,
              required: true,
              withModel: 'Role',
              modelNames: HelperService.generateNames('Role'),
            },
            {
              type: RelationType.BelongsTo,
              required: true,
              withModel: 'Permission',
              modelNames: HelperService.generateNames('Permission'),
            },
          ],
        }
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
      }),
    ])
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

    // CRUD for users table
    await this.createValidators(this.input.auth.table)
    await this.createController(this.input.auth.table)
    await HelperService.commit(
      `CRUD Added for ${this.input.auth.table.names.pascalCase}`,
      this.input.path
    )

    for (let i = 0; i < this.input.tables.length; i += 1) {
      const table = this.input.tables[i]
      await this.createMigration(table)
      await this.createModel(table)
      await this.createValidators(table)
      await this.createController(table)
      await HelperService.commit(
        `CRUD Added for ${this.input.tables[i].names.pascalCase}`,
        this.input.path
      )
    }
    await this.addRoutes()
    await HelperService.commit(`Routes Added for tables`, this.input.path)
    await this.createLazyMigration(this.input.auth.table)
    for (let i = 0; i < this.input.tables.length; i += 1) {
      await this.createLazyMigration(this.input.tables[i])
    }
    await this.createManyToManyMigrations()
    await HelperService.commit(`Circular migrations added`, this.input.path)
  }

  public async init() {
    await this.start()
  }
}
