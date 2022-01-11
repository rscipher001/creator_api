import Env from '@ioc:Adonis/Core/Env'
import { string } from '@ioc:Adonis/Core/Helpers'
import Application from '@ioc:Adonis/Core/Application'
import HelperService from 'App/Services/HelperService'
import { RelationType, RequestMethod } from 'App/Interfaces/Enums'
import ProjectInput, {
  Table,
  Relation,
  Permission,
  Role,
  RBACMatrix,
} from 'App/Interfaces/ProjectInput'

import AdonisInit from 'App/Services/Backend/Adonis/Init'
import AdonisAuthGenerator from 'App/Services/Backend/Adonis/AuthGenerator'
import AdonisCRUDGenerator from 'App/Services/Backend/Adonis/CRUDGenerator'
import AdonisRBACGenerator from 'App/Services/Backend/Adonis/RBACGenerator'
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

// import HostingService from 'App/Services/HostingService'

class BackendProjectService {
  private input: any
  private projectId: number
  private projectInput: ProjectInput

  constructor(input, projectId) {
    this.input = input
    this.projectId = projectId
  }

  public prepareTable(table): Table {
    table.name = HelperService.toSingularPascalCase(table.name)
    table.names = HelperService.generateNames(table.name)
    if (table.defaultColumn) {
      table.defaultColumn = this.input.camelCaseStrategy
        ? HelperService.toSingularCameCase(table.defaultColumn)
        : HelperService.toSingularSnakeCase(table.defaultColumn)
    }
    table.tableName = this.input.camelCaseStrategy
      ? table.names.camelCasePlural
      : table.names.snakeCasePlural
    table.columns = table.columns.map((column) => {
      column.name = HelperService.toSingularPascalCase(column.name)
      column.names = HelperService.generateNames(column.name)
      column.columnName = this.input.camelCaseStrategy
        ? column.names.camelCase
        : column.names.snakeCase
      return column
    })
    table.operations = {
      index: Boolean(table.operations.index),
      create: Boolean(table.operations.create),
      store: Boolean(table.operations.store),
      show: Boolean(table.operations.show),
      edit: Boolean(table.operations.edit),
      update: Boolean(table.operations.update),
      destroy: Boolean(table.operations.destroy),
      storeMany: Boolean(table.operations.storeMany),
      destroyMany: Boolean(table.operations.destroyMany),
    }
    if (Array.isArray(table.indexColumns)) {
      table.indexColumns = table.indexColumns.map((columnName) => string.pascalCase(columnName))
    }

    if (Array.isArray(table.relations)) {
      table.relations = table.relations.map((relation: Relation): Relation => {
        if (['$auth', '$nonAuth'].includes(relation.withModel)) {
          relation.modelNames = HelperService.generateNames(this.input.auth.table.name)
        } else if (relation.withModel === '$tenant') {
          relation.modelNames = HelperService.generateNames(this.projectInput.tenantSettings.table)
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

    if (Array.isArray(table.routeParents) && table.routeParents.length) {
      table.routeParentRelations = table.routeParents
        .reverse()
        .map((relationName: string) => HelperService.toSingularCameCase(relationName))
        .map((relationName: string) =>
          table.relations.find((relation) => relation.names.camelCase === relationName)
        )
    } else {
      table.routeParentRelations = []
    }

    if (Array.isArray(table.customOperations) && table.customOperations.length) {
      table.customOperations.map((op) => {
        return {
          name: string.camelCase(op.name),
          method: RequestMethod[op.method],
          singular: op.singular,
        }
      })
    }
    return table
  }

  protected prepareRBAC() {
    const rbac = this.input.rbac
    if (!rbac.enabled) return

    const roleTable = {
      generateRoute: true,
      generateController: true,
      generateModel: true,
      generateMigration: true,
      generateUI: true,
      seederUniqueKey: 'name',
      defaultColumn: 'name',
      relations: [
        {
          type: 'ManyToMany',
          withModel: 'Permission',
          name: '',
          required: true,
        },
      ],
      operations: {
        index: true,
        create: true,
        store: true,
        edit: true,
        show: true,
        update: true,
        destroy: true,
        storeMany: true,
        destroyMany: true,
      },
      customOperations: [],
      name: 'Role',
      timestamps: false,
      indexColumns: ['Name', 'Description', 'Default'],
      columns: [
        {
          name: 'Name',
          type: 'String',
          meta: {
            trim: true,
            expose: true,
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
          name: 'Description',
          type: 'String',
          meta: {
            displayName: '',
            required: false,
            expose: true,
            trim: true,
            maxLength: 256,
            multiline: true,
          },
          input: {
            type: 'Input',
          },
        },
        {
          name: 'Default',
          type: 'Boolean',
          meta: {
            displayName: '',
            required: false,
            expose: true,
          },
          input: {
            type: 'Input',
          },
        },
      ],
    }
    const permissionTable = {
      generateRoute: true,
      generateController: true,
      generateModel: true,
      generateMigration: true,
      generateUI: true,
      seederUniqueKey: 'name',
      defaultColumn: 'name',
      relations: [
        {
          type: 'ManyToMany',
          withModel: 'Role',
          name: '',
          required: true,
        },
      ],
      operations: {
        index: true,
        create: true,
        store: true,
        edit: true,
        show: true,
        update: true,
        destroy: true,
        storeMany: true,
        destroyMany: true,
      },
      customOperations: [],
      name: 'Permission',
      timestamps: false,
      indexColumns: ['Name', 'Description'],
      columns: [
        {
          name: 'Name',
          type: 'String',
          meta: {
            trim: true,
            expose: true,
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
          name: 'Description',
          type: 'String',
          meta: {
            expose: true,
            required: false,
            trim: true,
            maxLength: 256,
            multiline: true,
          },
          input: {
            type: 'Input',
          },
        },
      ],
    }

    if (rbac.multipleRoles) {
      // User <> Role many2many
      roleTable.relations.push({
        type: 'ManyToMany',
        withModel: '$auth',
        name: '',
        required: true,
      })
      this.input.auth.table.relations.push({
        type: 'ManyToMany',
        withModel: 'Role',
        name: '',
        required: true,
      })
    } else {
      // User belongs to role
      roleTable.relations.push({
        type: 'HasMany',
        withModel: '$auth',
        name: '',
        required: true,
      })
      this.input.auth.table.relations.push({
        type: 'BelongsTo',
        withModel: 'Role',
        name: '',
        required: true,
        lazy: true,
      })
    }
    this.input.tables.unshift(permissionTable)
    this.input.tables.unshift(roleTable)

    this.input.rbac.roles = this.input.rbac.roles.map((r: Role) => {
      r.name = HelperService.toSingularCameCase(r.name)
      if (r.description === undefined) {
        r.description = ''
      }
      return r
    })

    this.input.rbac.permissions = this.input.rbac.permissions.map((permission: Permission) => {
      const [r, p] = permission.name.split(':')
      const resourceName = HelperService.toSingularCameCase(r)
      const permissionName = HelperService.toSingularCameCase(p)
      if (permission.description === undefined) {
        permission.description = ''
      }
      permission.name = `${resourceName}:${permissionName}`
      return permission
    })

    this.input.rbac.matrix = this.input.rbac.matrix.map((matrixItem: RBACMatrix) => {
      matrixItem.role = HelperService.toSingularCameCase(matrixItem.role)
      matrixItem.permissions = matrixItem.permissions.map((permission) => {
        const [r, p] = permission.split(':')
        const resourceName = HelperService.toSingularCameCase(r)
        const permissionName = HelperService.toSingularCameCase(p)
        return `${resourceName}:${permissionName}`
      })
      return matrixItem
    })
  }

  /**
   * Prepares input by cleaning and standardize it
   */
  public prepare(): ProjectInput {
    this.prepareAuthTable()
    this.prepareRBAC()
    this.input.name = HelperService.toSingularPascalCase(this.input.name)
    const projectInput: any = {}

    // Fields that don't need processing
    projectInput.camelCaseStrategy = this.input.camelCaseStrategy
    projectInput.generate = this.input.generate

    projectInput.database = this.input.database
    projectInput.types = this.input.types
    projectInput.logging = {
      enabled: true,
    }

    projectInput.mailers = this.input.mailers
    projectInput.mailEnabled = this.input.mailEnabled

    projectInput.storageEnabled = this.input.storageEnabled
    projectInput.storageDrivers = this.input.storageDrivers
    projectInput.defaultStorageDriver = this.input.defaultStorageDriver

    projectInput.rbac = this.input.rbac
    projectInput.tech = this.input.tech
    projectInput.auth = this.input.auth
    projectInput.tenantSettings = this.input.tenantSettings
    if (projectInput.tenantSettings.table) {
      projectInput.tenantSettings.name = HelperService.toSingularPascalCase(
        projectInput.tenantSettings.table
      )
      projectInput.tenantSettings.names = HelperService.generateExtendedNames(
        projectInput.tenantSettings.table
      )
    }

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

    // Do it twice to ensure relation setting is in place
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

    // Hosting related preparation
    this.prepareHosting()
    return this.projectInput
  }

  protected prepareHosting() {
    this.projectInput.hosting = {
      databaseName: `${this.projectInput.names.snakeCase}-${this.projectInput.id}`,
      databaseUser: `${this.projectInput.names.camelCase}`,
      databasePassword: `${this.projectInput.names.pascalCase}`,
    }
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

  /**
   * Add private fields to auth table
   */
  protected prepareAuthTable() {
    const columns: any = [
      {
        name: 'Name',
        type: 'String',
        meta: {
          displayName: 'Name',
          required: true,
          filterable: true,
          minLength: 2,
          maxLength: 127,
        },
        input: {
          type: 'Input',
        },
      },
      {
        name: 'Email',
        type: 'String',
        meta: {
          displayName: 'Email',
          required: true,
          filterable: true,
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
        name: 'Password',
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
    ]
    if (this.input.mailEnabled) {
      columns.push({
        name: 'emailVerifiedAt',
        type: 'Date',
        meta: {
          expose: false,
          required: false,
        },
      })
    }
    if (this.input.storageEnabled) {
      columns.push({
        name: 'Avatar',
        type: 'File',
        meta: {
          required: false,
          expose: true,
          trim: false,
          maxSize: '1mb',
          extensions: ['jpg', 'png', 'jpeg'],
        },
      })
    }
    this.input.auth.table.indexColumns = ['Name', 'Email']
    this.input.auth.table.defaultColumn = 'Name'
    this.input.auth.table.columns.splice(0, 0, ...columns)
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
          type: 'String',
          meta: {
            ...emailColumn,
            ...{
              expose: false,
            },
          },
        },
        {
          name: 'token',
          type: 'String',
          meta: {
            expose: false,
            index: true,
            length: 128,
            required: true,
          },
        },
        {
          name: 'reason',
          type: 'String',
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
          type: 'BelongsTo',
          withModel: '$auth',
          name: '',
          required: false,
        },
      ],
    }
    this.input.tables.unshift(verificationTokenTable)
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

        // Add RBAC
        const rbac = new AdonisRBACGenerator(this.projectInput)
        await rbac.init()

        if (
          this.projectInput.mailEnabled &&
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

        // Add build step in pre commit hooks
        // Removed during generation to avoid slow down and
        // Non fatal build failures
        await init.ehancePreCommitHook()
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

      // const hostingService = new HostingService(this.projectInput)
      // await hostingService.init()
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  /**
   * Prepare input
   */
  public async init() {
    this.prepare() // Clean and preprocess input
    await this.start() // Start generation
  }
}
export default BackendProjectService
