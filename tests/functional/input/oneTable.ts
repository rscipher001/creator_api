/**
 * Simplest type of project, there is only one table with name and description field
 * 1. Mail is disabled
 * 2. File upload is disabled
 * 3. RBAC is disabled
 */
export default {
  name: 'OneTable',
  database: 'MySQL',
  mailEnabled: false,
  defaultMailer: 'SMTP',
  mailers: ['SMTP'],
  storageEnabled: false,
  storageDrivers: ['Local'],
  defaultStorageDriver: 'Local',
  types: ['API'],
  camelCaseStrategy: true,
  tech: {
    backend: 'Adonis',
    frontend: 'Buefy',
  },
  generate: {
    api: {
      generate: true,
      init: true,
      db: true,
      auth: true,
      crud: true,
      test: true,
    },
    spa: {
      generate: true,
      init: true,
      auth: true,
      crud: true,
    },
    app: {
      generate: false,
    },
    website: {
      generate: false,
    },
  },
  auth: {
    register: true,
    passwordReset: false,
    passwordChange: true,
    table: {
      generateRoute: true,
      generateController: true,
      generateModel: true,
      generateMigration: false,
      generateUI: true,
      defaultColumn: 'Name',
      relations: [],
      operations: {
        index: true,
        create: true,
        store: true,
        show: true,
        edit: true,
        update: true,
        destroy: true,
        storeMany: true,
        destroyMany: true,
      },
      indexColumns: ['Name', 'Email'],
      customOperations: [],
      name: 'User',
      timestamps: true,
      columns: [],
    },
  },
  tenantSettings: {
    user: 1,
    tenant: 0,
    table: null,
  },
  rbac: {
    enabled: false,
    multipleRoles: false,
    roles: [
      {
        name: 'Admin',
        description: 'User with full access to everything',
        default: false,
      },
    ],
    permissions: [],
    matrix: [
      {
        role: 'Admin',
        permissions: [],
      },
    ],
  },
  tables: [
    {
      name: 'Country',
      timestamps: true,
      generateRoute: true,
      generateModel: true,
      generateUI: true,
      generateController: true,
      generateMigration: true,
      singleton: false,
      parent: null,
      routeParents: [],
      indexColumns: ['Name'],
      operations: {
        index: true,
        create: true,
        store: true,
        show: true,
        edit: true,
        update: true,
        destroy: true,
        storeMany: true,
        destroyMany: true,
      },
      customOperations: [],
      columns: [
        {
          meta: {
            required: true,
            expose: true,
            filterable: true,
            sortable: true,
            trim: true,
            maxLength: '128',
            minLength: '2',
            defaultTo: ' ',
          },
          input: {
            type: 'Input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'Name',
          type: 'String',
        },
        {
          meta: {
            required: false,
            expose: true,
            filterable: false,
            sortable: false,
            trim: true,
            maxLength: '4096',
            multiline: true,
          },
          input: {
            type: 'Input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'Description',
          type: 'String',
        },
      ],
      relations: [],
      defaultColumn: 'Name',
    },
  ],
}
