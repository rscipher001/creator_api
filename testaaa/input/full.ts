import {
  ProjectType,
  Database as DatabaseEnum,
  Mailer,
  Storage,
  Backend,
  Frontend,
  RelationType,
} from 'App/Interfaces/Enums'

/**
 * Input with most thingsl
 */
const fulProjectInput = {
  name: 'CIFullAPITest',
  database: DatabaseEnum.MySQL,
  types: [ProjectType.API],
  mailers: [Mailer.SMTP],
  mailEnabled: true,
  storageEnabled: true,
  defaultMailer: Mailer.SMTP,
  storageDrivers: [Storage.Local],
  defaultStorageDriver: Storage.Local,
  camelCaseStrategy: true,
  tech: {
    backend: Backend.Adonis,
    frontend: Frontend.Buefy,
  },
  generate: {
    api: {
      generate: true,
      crud: true,
      test: true,
    },
    spa: {
      generate: false,
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
    passwordReset: true,
    passwordChange: true,
    table: {
      generateController: true,
      generateUI: true,
      generateModel: true,
      generateMigration: true,
      operations: {
        index: true,
        store: true,
        update: true,
        destroy: true,
        storeMany: true,
        destroyMany: true,
      },
      customOperations: [],
      indexColumns: ['Name', 'Email'],
      relations: [],
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
  tables: [
    {
      name: 'Country',
      timestamps: true,
      generateController: true,
      generateModel: true,
      generateMigration: true,
      generateUI: true,
      singleton: false,
      parent: null,
      routeParents: [],
      indexColumns: ['Name', 'ISOCode'],
      operations: {
        index: true,
        store: true,
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
            trim: true,
            minLength: 2,
            maxLength: 127,
          },
          input: {
            type: 'Input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: [],
            },
          },
          name: 'name',
          type: 'String',
        },
        {
          meta: {
            displayName: 'ISO Code',
            required: true,
            expose: true,
            trim: true,
            minLength: 3,
            maxLength: 3,
          },
          input: {
            type: 'Input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: [],
            },
          },
          name: 'isoCode',
          type: 'String',
        },
      ],
      relations: [],
    },
    {
      name: 'State',
      timestamps: true,
      generateController: true,
      generateModel: true,
      generateMigration: true,
      generateUI: true,
      singleton: false,
      parent: null,
      routeParents: ['Country'],
      indexColumns: ['name'],
      operations: {
        index: true,
        store: true,
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
            trim: true,
            minLength: 2,
            maxLength: 127,
          },
          input: {
            type: 'Input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: [],
            },
          },
          name: 'name',
          type: 'String',
        },
        {
          meta: {
            required: true,
            expose: true,
            trim: true,
            minLength: 3,
            maxLength: 3,
          },
          input: {
            type: 'Input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: [],
            },
          },
          name: 'isoCode',
          type: 'String',
        },
      ],
      relations: [
        {
          type: RelationType.BelongsTo,
          withModel: 'Country',
          name: '',
          required: true,
        },
      ],
    },
    {
      name: 'Profile',
      timestamps: true,
      generateController: true,
      generateModel: true,
      generateMigration: true,
      generateUI: true,
      singleton: true,
      parent: '$auth',
      routeParents: [],
      indexColumns: ['address'],
      operations: {
        index: true,
        store: true,
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
            trim: true,
            minLength: 25,
            maxLength: 512,
            multiline: true,
          },
          input: {
            type: 'Input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: [],
            },
          },
          name: 'address',
          type: 'String',
        },
      ],
      relations: [
        {
          type: RelationType.BelongsTo,
          withModel: '$auth',
          name: '',
          required: true,
        },
      ],
    },
    {
      name: 'Product',
      timestamps: true,
      generateController: true,
      generateModel: true,
      generateMigration: true,
      generateUI: true,
      singleton: false,
      parent: null,
      routeParents: [],
      indexColumns: ['name'],
      operations: {
        index: true,
        store: true,
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
            trim: true,
            minLength: 2,
            maxLength: 127,
          },
          input: {
            type: 'Input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: [],
            },
          },
          name: 'name',
          type: 'String',
        },
      ],
      relations: [
        {
          type: RelationType.ManyToMany,
          withModel: 'seller',
          name: '',
          required: true,
        },
      ],
    },
    {
      name: 'seller',
      timestamps: true,
      generateController: true,
      generateModel: true,
      generateMigration: true,
      generateUI: true,
      singleton: false,
      parent: null,
      indexColumns: ['name'],
      routeParents: [],
      operations: {
        index: true,
        store: true,
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
            trim: true,
            minLength: 2,
            maxLength: 127,
          },
          input: {
            type: 'Input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: [],
            },
          },
          name: 'name',
          type: 'String',
        },
      ],
      relations: [
        {
          type: RelationType.ManyToMany,
          withModel: 'Product',
          name: '',
          required: true,
        },
      ],
    },
    {
      name: 'Minion',
      timestamps: true,
      generateController: true,
      generateModel: true,
      generateMigration: true,
      generateUI: true,
      parent: '$auth',
      routeParents: [],
      indexColumns: ['address'],
      operations: {
        index: true,
        store: true,
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
            trim: true,
            minLength: 25,
            maxLength: 512,
            multiline: true,
          },
          input: {
            type: 'Input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: [],
            },
          },
          name: 'address',
          type: 'String',
        },
      ],
      relations: [
        {
          type: RelationType.BelongsTo,
          withModel: '$auth',
          name: '',
          required: true,
        },
      ],
    },
    {
      name: 'Task',
      timestamps: true,
      generateController: true,
      generateModel: true,
      generateMigration: true,
      generateUI: true,
      parent: 'Minion',
      routeParents: ['Minion'],
      indexColumns: ['address'],
      operations: {
        index: true,
        store: true,
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
            trim: true,
            minLength: 25,
            maxLength: 512,
            multiline: true,
          },
          input: {
            type: 'Input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: [],
            },
          },
          name: 'address',
          type: 'String',
        },
      ],
      relations: [
        {
          type: RelationType.BelongsTo,
          withModel: 'Minion',
          name: '',
          required: true,
        },
      ],
    },
    {
      name: 'Subtask',
      timestamps: true,
      generateController: true,
      generateModel: true,
      generateMigration: true,
      generateUI: true,
      parent: 'Task',
      indexColumns: ['address'],
      routeParents: ['Task', 'Minion'],
      operations: {
        index: true,
        store: true,
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
            trim: true,
            minLength: 25,
            maxLength: 512,
            multiline: true,
          },
          input: {
            type: 'Input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: [],
            },
          },
          name: 'address',
          type: 'String',
        },
      ],
      relations: [
        {
          type: RelationType.BelongsTo,
          withModel: 'Task',
          name: '',
          required: true,
        },
      ],
    },
    {
      name: 'SubtaskVerification',
      timestamps: true,
      generateController: true,
      generateModel: true,
      generateMigration: true,
      generateUI: true,
      singleton: true,
      indexColumns: ['address'],
      parent: 'Subtask',
      routeParents: ['Subtask', 'Task', 'Minion'],
      operations: {
        index: false,
        store: true,
        update: false,
        destroy: true,
        storeMany: false,
        destroyMany: false,
      },
      customOperations: [],
      columns: [
        {
          meta: {
            required: true,
            expose: true,
            trim: true,
            minLength: 25,
            maxLength: 512,
            multiline: true,
          },
          input: {
            type: 'Input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: [],
            },
          },
          name: 'address',
          type: 'String',
        },
      ],
      relations: [
        {
          type: RelationType.BelongsTo,
          withModel: 'Subtask',
          name: '',
          required: true,
        },
      ],
    },
  ],
  rbac: {
    enabled: true,
    multipleRoles: true,
    roles: [
      {
        name: 'Admin',
        description: 'Random struing lorem ipsum',
        default: false,
      },
      {
        name: 'User',
        description: 'Random struing lorem ipsum',
        default: true,
      },
      {
        name: 'Engineer',
        description: 'Random struing lorem ipsum',
        default: false,
      },
    ],
    permissions: [
      {
        name: 'user:index',
      },
    ],
    matrix: [
      {
        role: 'Admin',
        permissions: [],
        default: false,
      },
    ],
  },
}

export default fulProjectInput
