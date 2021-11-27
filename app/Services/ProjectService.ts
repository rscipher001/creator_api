import Env from '@ioc:Adonis/Core/Env'
import { string } from '@ioc:Adonis/Core/Helpers'
import Application from '@ioc:Adonis/Core/Application'
import HelperService from 'App/Services/HelperService'
import ProjectInput, { Table, Relation } from 'App/Interfaces/ProjectInput'

import AdonisInit from 'App/Services/Backend/Adonis/Init'
import AdonisAuthGenerator from 'App/Services/Backend/Adonis/AuthGenerator'
import AdonisCRUDGenerator from 'App/Services/Backend/Adonis/CRUDGenerator'
import AdonisTestGenerator from 'App/Services/Backend/Adonis/TestGenerator'
import AdonisMailerGenerator from 'App/Services/Backend/Adonis/MailerGenerator'
import AdonisTenantGenerator from 'App/Services/Backend/Adonis/TenantGenerator'
import AdonisProfileGenerator from 'App/Services/Backend/Adonis/ProfileGenerator'
import AdonisDatabaseGenerator from 'App/Services/Backend/Adonis/DatabaseGenerator'
import AdonisPasswordResetGenerator from 'App/Services/Backend/Adonis/PasswordResetGenerator'
import AdonisStorageDriverGenerator from 'App/Services/Backend/Adonis/StorageDriverGenerator'

import BuefyInit from 'App/Services//Frontend/Buefy/Init'
import BuefyAuthGenerator from 'App/Services/Frontend/Buefy/AuthGenerator'
import BuefyCRUDGenerator from 'App/Services/Frontend/Buefy/CRUDGenerator'
import { RelationType } from 'App/Interfaces/Enums'

class BackendProjectService {
  private input: any
  private projectId: number
  private projectInput: ProjectInput

  constructor(input, projectId) {
    this.input = input
    this.projectId = projectId
  }

  public prepareTable(table): Table {
    table.name = string.pascalCase(table.name)
    table.names = HelperService.generateNames(table.name)
    table.tableName = this.input.camelCaseStrategy
      ? table.names.camelCasePlural
      : table.names.snakeCasePlural
    table.columns = table.columns.map((column) => {
      column.name = string.pascalCase(column.name)
      column.names = HelperService.generateNames(column.name)
      column.columnName = this.input.camelCaseStrategy
        ? column.names.camelCase
        : column.names.snakeCase
      return column
    })
    if (Array.isArray(table.indexColumns)) {
      table.indexColumns = table.indexColumns.map((columnName) => string.pascalCase(columnName))
    }
    if (Array.isArray(table.routeParents)) {
      table.routeParents = table.routeParents
        .reverse()
        .map((modelName: string) => string.camelCase(modelName))
    } else {
      table.routeParents = []
    }
    if (Array.isArray(table.relations)) {
      table.relations = table.relations.map((relation: Relation): Relation => {
        if (relation.withModel === '$auth') {
          relation.modelNames = HelperService.generateNames(this.input.auth.table.name)
        } else {
          relation.modelNames = HelperService.generateNames(relation.withModel)
          relation.withModel = relation.modelNames.pascalCase
        }

        if (relation.name) {
          relation.names = HelperService.generateNames(relation.name)
          relation.name = relation.names.pascalCase
        } else {
          relation.names = relation.modelNames
          relation.name = relation.withModel
        }

        return relation
      })
    } else {
      table.relations = []
    }
    return table
  }

  /**
   * Prepares input by cleaning and standardize it
   */
  public prepare(): ProjectInput {
    this.input.name = HelperService.toSingularPascalCase(this.input.name)
    const projectInput: any = {}

    // Fields that don't need processing
    projectInput.camelCaseStrategy = this.input.camelCaseStrategy
    projectInput.generate = this.input.generate

    projectInput.database = this.input.database
    projectInput.types = this.input.types

    projectInput.mailers = this.input.mailers
    projectInput.mailEnabled = this.input.mailEnabled

    projectInput.storageEnabled = this.input.storageEnabled
    projectInput.storageDrivers = this.input.storageDrivers
    projectInput.defaultStorageDriver = this.input.defaultStorageDriver

    projectInput.tech = this.input.tech
    projectInput.auth = this.input.auth
    projectInput.tenantSettings = this.input.tenantSettings

    // Fields that needs processign
    projectInput.id = this.projectId
    projectInput.names = HelperService.generateExtendedNames(this.input.name)
    projectInput.name = projectInput.names.pascalCase

    projectInput.projectsPath = Application.makePath(Env.get('PROJECT_PATH'))
    projectInput.basePath = `${this.projectId}-${projectInput.names.dashCase}`
    projectInput.path = `${projectInput.projectsPath}/${projectInput.basePath}`
    projectInput.spaPath = `${projectInput.projectsPath}/${projectInput.basePath}-spa`
    projectInput.defaultMailer = this.input.defaultMailer.toLowerCase()
    projectInput.auth.table = this.prepareTable(this.input.auth.table)

    if (this.input.auth.passwordReset) {
      this.addReseTokenTables()
    }

    projectInput.tables = this.input.tables.map((table) => this.prepareTable(table))
    if (!this.input.git) {
      projectInput.git = {
        email: '22148496+SecureSnowball@users.noreply.github.com',
        name: 'Ravindra Sisodia',
      }
    } else {
      projectInput.git = this.input.git
    }
    this.projectInput = projectInput as ProjectInput
    this.prepareTenantSettings()
    this.prepareRouteParentTables()
    return this.projectInput
  }

  protected prepareTenantSettings() {
    if (this.projectInput.tenantSettings.tenant !== 0) {
      const tenantCount = this.projectInput.tenantSettings.tenant
      const userCount = this.projectInput.tenantSettings.user

      // Prepare input if there is tenant(s)
      this.projectInput.tenantSettings.names = HelperService.generateExtendedNames(
        this.projectInput.tenantSettings.table
      )
      const tenantTableIndex = this.projectInput.tables.findIndex(
        (table) => table.names.pascalCase === this.projectInput.tenantSettings.table
      )
      if (tenantTableIndex === -1) {
        throw new Error('Tenant table not found')
      }

      if (userCount === 1 && tenantCount === 1) {
        /**
         * One user & one tenant
         * User belongs to tenant so user collection will have tenant Id
         * 1. Create a lazy migration for adding tenant foreign key to auth table after both are created
         * 2. Add relation to models
         */
        const authTable = this.projectInput.auth.table
        const tenantTable = this.projectInput.tables[tenantTableIndex]
        authTable.relations.push({
          type: RelationType.BelongsTo,
          withModel: tenantTable.names.pascalCase,
          modelNames: tenantTable.names,
          names: tenantTable.names,
          name: tenantTable.names.pascalCase,
          required: false,
          lazy: true,
        })
        tenantTable.relations.push({
          type: RelationType.HasOne,
          withModel: authTable.names.pascalCase,
          modelNames: authTable.names,
          names: authTable.names,
          name: authTable.names.pascalCase,
          required: true,
        })
      }

      if (userCount === 1 && tenantCount === 'n') {
        /**
         * One user & multiple tenant
         * Tenant belongs to user so tenant have userId
         * 1. Add relation models
         */
        const authTable = this.projectInput.auth.table
        const tenantTable = this.projectInput.tables[tenantTableIndex]
        tenantTable.relations.push({
          type: RelationType.BelongsTo,
          withModel: authTable.names.pascalCase,
          modelNames: authTable.names,
          names: authTable.names,
          name: authTable.names.pascalCase,
          required: true,
          lazy: false,
        })
        authTable.relations.push({
          type: RelationType.HasMany,
          withModel: tenantTable.names.pascalCase,
          modelNames: tenantTable.names,
          names: tenantTable.names,
          name: tenantTable.names.pascalCase,
          required: true,
        })
      }

      if (tenantCount === 1 && userCount === 'n') {
        /**
         * One tenant & multiple user
         * User belongs to tenant so user have tenantId
         * 1. Add relation to models
         */
        const authTable = this.projectInput.auth.table
        const tenantTable = this.projectInput.tables[tenantTableIndex]
        authTable.relations.push({
          type: RelationType.BelongsTo,
          withModel: tenantTable.names.pascalCase,
          modelNames: tenantTable.names,
          names: tenantTable.names,
          name: tenantTable.names.pascalCase,
          required: false,
          lazy: true,
        })
        tenantTable.relations.push({
          type: RelationType.HasMany,
          withModel: authTable.names.pascalCase,
          modelNames: authTable.names,
          names: authTable.names,
          name: authTable.names.pascalCase,
          required: true,
        })
      }

      if (tenantCount === 'n' && userCount === 'n') {
        /**
         * Many to many
         * 1. Add relation to models
         */
        const authTable = this.projectInput.auth.table
        const tenantTable = this.projectInput.tables[tenantTableIndex]
        authTable.relations.push({
          type: RelationType.HasMany,
          withModel: tenantTable.names.pascalCase,
          modelNames: tenantTable.names,
          names: tenantTable.names,
          name: tenantTable.names.pascalCase,
          required: false,
          lazy: false,
        })
        tenantTable.relations.push({
          type: RelationType.HasMany,
          withModel: authTable.names.pascalCase,
          modelNames: authTable.names,
          names: authTable.names,
          name: authTable.names.pascalCase,
          required: false,
          lazy: false,
        })
      }
    }
  }

  protected prepareRouteParentTables() {
    this.projectInput.tables.forEach((table: Table) => {
      table.routeParentTables = []
      if (Array.isArray(table.routeParents) && table.routeParents.length) {
        table.routeParents.forEach((routeParent: string) => {
          // Find the table and push it into routeParentTables array
          const routeParentTable = this.projectInput.tables.find(
            (table) => table.names.camelCase === routeParent
          )
          if (!routeParentTable) {
            throw new Error('Table data is not correct')
          }
          table.routeParentTables.push(routeParentTable)
        })
      }
    })
  }

  /**
   * Add private fields to auth table
   */
  protected prepareAuthTable() {
    this.input.auth.table.columns.splice(
      0,
      0,
      {
        name: 'name',
        type: 'String',
        meta: {
          displayName: 'Name',
          required: true,
          minLength: 2,
          maxLength: 127,
        },
        input: {
          type: 'Input',
        },
      },
      {
        name: 'email',
        type: 'String',
        meta: {
          displayName: 'Email',
          required: true,
          minLength: 6,
          maxLength: 127,
          email: true,
          unique: true,
        },
        input: {
          type: 'Input',
        },
      },
      {
        name: 'password',
        type: 'String',
        meta: {
          displayName: 'Password',
          trim: true,
          secret: true,
          maxLength: 64,
          minLength: 8,
          dbLength: 255,
          required: true,
        },
        input: {
          type: 'Input',
        },
      },
      {
        name: 'rememberMeToken',
        type: 'String',
        meta: {
          expose: false,
          required: false,
        },
      },
      {
        name: 'emailVerifiedAt',
        type: 'Date',
        meta: {
          expose: false,
          required: false,
        },
      },
      {
        name: 'avatar',
        type: 'File',
        meta: {
          required: false,
          expose: true,
          trim: false,
          maxSize: '1mb',
          extensions: ['jpg', 'png', 'jpeg'],
        },
      }
    )
  }

  /**
   * Add tokens table if password reset is enabled
   */
  protected addReseTokenTables() {
    const emailColumn = this.input.auth.table.columns.find((column) => column.name === 'email')
    const verificationTokenTable = {
      generateController: false,
      generateModel: false,
      generateUI: false,
      generateMigration: true,
      operations: [],
      name: 'VerificationToken',
      timestamps: true,
      columns: [
        {
          name: 'email',
          type: 'string',
          meta: {
            ...emailColumn,
            ...{
              expose: false,
            },
          },
        },
        {
          name: 'token',
          type: 'string',
          meta: {
            expose: false,
            index: true,
            length: 128,
            required: true,
          },
        },
        {
          name: 'reason',
          type: 'string',
          meta: {
            expose: false,
            index: true,
            length: 128,
            required: true,
          },
        },
      ],
      relations: [
        {
          type: 'belongsTo',
          withModel: '$auth',
          name: '',
          required: false,
        },
      ],
    }
    this.input.tables.push(verificationTokenTable)
  }

  /**
   * Handle complete project creation
   */
  public async start() {
    try {
      // Generate Project
      if (this.projectInput.generate.api.generate) {
        const init = new AdonisInit(this.projectInput)
        await init.init() // Initialize project

        // Add database
        const db = new AdonisDatabaseGenerator(this.projectInput)
        await db.init()

        // Add storage driver
        if (this.projectInput.storageEnabled) {
          const storageDriver = new AdonisStorageDriverGenerator(this.projectInput)
          await storageDriver.init()
        }

        // Add mailer
        if (this.projectInput.mailEnabled) {
          const mailer = new AdonisMailerGenerator(this.projectInput)
          await mailer.init()
        }

        // Add Auth
        const auth = new AdonisAuthGenerator(this.projectInput)
        await auth.init()

        if (
          this.projectInput.mailers.length &&
          (this.projectInput.auth.passwordChange || this.projectInput.auth.passwordReset)
        ) {
          // Add Password reset
          const passwordReset = new AdonisPasswordResetGenerator(this.projectInput)
          await passwordReset.init()
        }

        // Add Profile
        const profile = new AdonisProfileGenerator(this.projectInput)
        await profile.init()

        // Add Tenant
        if (this.projectInput.tenantSettings.tenant !== 0) {
          const tenant = new AdonisTenantGenerator(this.projectInput)
          await tenant.init()
        }

        // Add CRUD for models
        if (this.projectInput.generate.api.crud) {
          const crud = new AdonisCRUDGenerator(this.projectInput)
          await crud.init()
        }

        // Add Tests for everything
        if (this.projectInput.generate.api.test) {
          const test = new AdonisTestGenerator(this.projectInput)
          await test.init()
        }
      }

      // Prepare frontend
      if (this.projectInput.generate.spa.generate) {
        const spa = new BuefyInit(this.projectInput)
        await spa.init()

        // Prepare frontend auth
        const auth = new BuefyAuthGenerator(this.projectInput)
        await auth.init()

        // Add CRUD for models
        if (this.projectInput.generate.spa.crud) {
          const crud = new BuefyCRUDGenerator(this.projectInput)
          await crud.init()
        }
      }
      console.log('Project Generated Successfully')
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  /**
   * Prepare input
   */
  public async init() {
    this.prepareAuthTable()
    this.prepare() // Clean and preprocess input
    await this.start() // Start generation
  }
}
export default BackendProjectService
