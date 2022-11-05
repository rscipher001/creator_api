import { Database, Mailer, ProjectType, RelationType, RequestMethod } from './Enums'

export interface Hosting {
  databaseName: string
  databaseUser: string
  databasePassword: string
}

export interface Names {
  camelCase: string
  pascalCase: string
  snakeCase: string
  camelCasePlural: string
  pascalCasePlural: string
  snakeCasePlural: string
}

export interface Role {
  name: string
  description?: string
  default?: boolean
}

export interface Permission {
  name: string
  description?: string
}

export interface ExtendedNames extends Names {
  dashCase: string
  dashCasePlural: string
}

export interface Logging {
  enabled: boolean
}

export interface Meta {
  expose: boolean // If this field is false then it won't show in create/update form
  filterable?: boolean // If true generate filter option on list page
  sortable?: boolean // If true table can be sorted with this column
  dbLength?: number // Override length in db, useful for fields like password
  secret?: boolean // These fields won't be serialized like password, only works with string for now
  required: boolean // Required or not on db level, propogated in all layers
  unique?: boolean // Unique on db level, propogated till validation layer
  multiline?: boolean // Text or string on db level, propogated in all layers
  minLength?: number // Min length in string in UI and validator
  maxLength?: number // Max length in string in DB, UI and validator
  email?: boolean // String is email or not, UI and validator
  url?: boolean // String is url or not, UI and validator
  min?: number // Number min value, UI and validator
  max?: number // Number max value, UI and validator
  defaultTo?: string | number | boolean // Default value in db
  index?: boolean // Database level index
  maxSize?: string // Max file size allowed
  extensions?: string[] // Allowed file extensions
}

/**
 * Multiline string is alrady converted to textarea, only available option is WYSIWYG
 * String, Number can be input, select
 * Boolean can be switch or checkbox
 * Maxlength and minlengh is already coming from meta
 */
export interface Input {
  displayName?: string // Display name will be used as label when displaying a field
  type?: string // input, select, switch, file(String only)
  decimal?: {
    step: number | string // Only allowed for decimal inputs
  }
  select?: {
    type: string
    options: any[]
  }
}

export interface Column {
  name: string
  names: Names
  columnName: string // In DB
  type: string // string, decimal, integer, date, boolean
  meta: Meta
  input?: Input
}

export interface CustomOperation {
  name: string
  method: RequestMethod // GET, POST, PATCH, etc
  singular: boolean // Item id is required for operation
}
export interface Operations {
  index: boolean
  create: boolean
  store: boolean
  show: boolean
  edit: boolean
  update: boolean
  destroy: boolean
  storeMany: boolean
  destroyMany: boolean
}

export interface Table {
  name: string // Name of the Model
  names: Names // CamelCase, PascalCase, SnakeCase, etc of name
  tableName: string // In DB
  defaultColumn?: string // This column will be used as label with this table data is displayed somewhere
  generateController: boolean // Generate controller if true
  generateModel: boolean // Generate model if true
  generateMigration: boolean // Generate migration if true
  generateUI: boolean //Generate CRUD if true
  generateRoute: boolean // Route only generated if true
  singleton: boolean // Singleton means only one instace per parent.
  routeParents: string[] // Route parents are parent relations for routing
  indexColumns: string[] // Only these items will be used on listing page
  routeParentRelations: Relation[] // Route parents relations for use in controller
  operations: Operations // Basic CRUD operations
  customOperations: CustomOperation[] // Basic CRUD operations
  columns: Column[]
  timestamps: boolean
  relations: Relation[]
  seederUniqueKey?: string // To ensure seeder data is not duplicate
}

export interface Relation {
  type: RelationType
  withModel: string
  modelNames: Names // Model name in all forms
  names?: Names // Relation name in all forms
  name?: string // Relation name, by default table name is used
  required: boolean // Not applicable to many to many
  lazy?: boolean // Migration will be created separately for foreign key
  showInputOnCreatePage?: boolean // Show dropdown for selecting/attaching relation on create page, for required relation it is shown `
}

export interface RBAC {
  enabled: boolean
  multipleRoles: boolean
  roles: Role[]
  permissions: Permission[]
  matrix: RBACMatrix[]
}

export interface RBACMatrix {
  role: string
  permissions: string[]
}

export default interface ProjectInput {
  id: number
  name: string // should be camelcase
  names: ExtendedNames
  projectsPath: string // Folder where all prjoects are stored
  path: string // API folder full path
  spaPath: string // SPA folder full path
  basePath: string // Project folder name
  appPath?: string // App Path
  mailEnabled: boolean
  mailers: Mailer[]
  defaultMailer: string
  storageEnabled: boolean
  storageDrivers: string[]
  defaultStorageDriver: string
  generate: {
    api: {
      generate: boolean
      crud: boolean
      test: boolean
    }
    spa: {
      generate: boolean
      crud: boolean
      test: boolean
    }
    app: {
      generate: boolean
      crud: boolean
      test: boolean
    }
    website: {
      generate: boolean
      crud: boolean
      test: boolean
    }
  }
  auth: {
    register: boolean // Enable register
    passwordReset: boolean // Enable password reset
    passwordChange: boolean // Enable password change
    table: Table
  }
  git: {
    name: string
    email: string
  }
  database: Database
  types: ProjectType[] // should be smallcaps, can be api or web
  camelCaseStrategy: boolean
  tables: Table[]
  tech: {
    backend?: string
    frontend?: string
    app?: string
  }
  tenantSettings: {
    user: number | string // 1 or n
    tenant: number | string // 0, 1 or n
    table?: string // Table name
    names?: ExtendedNames // Table names in all cases
  }
  rbac: RBAC
  hosting: Hosting
  app?: {
    appName: string
    packageName: string
  }
}
