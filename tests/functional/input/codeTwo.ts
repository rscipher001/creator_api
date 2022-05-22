/**
 * To test input fields generators with all data types
 * String - Select(Key value and string) and input
 * Decimal - Select(Key value and string) and Input
 * Integer - Select(Key value and string) and Input
 * Date - Input
 * Boolean - Toggle and checkbox
 * 1. Mail is disabled
 * 2. File upload is disabled
 * 3. RBAC is disabled
 */
export default {
  name: 'CodeTwo',
  database: 'MySQL',
  types: ['API'],
  camelCaseStrategy: true,
  mailEnabled: false,
  mailers: ['SMTP'],
  defaultMailer: 'SMTP',
  storageEnabled: false,
  storageDrivers: ['Local'],
  defaultStorageDriver: 'Local',
  tech: {
    backend: 'Adonis',
    frontend: 'Buefy',
  },
  generate: {
    api: {
      generate: true,
      crud: true,
      test: true,
    },
    spa: {
      generate: true,
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
      name: 'User',
      generateUI: true,
      generateController: true,
      generateModel: true,
      generateMigration: false,
      defaultColumn: 'Name',
      timestamps: true,
      generateRoute: true,
      indexColumns: ['Name', 'Email'],
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
      relations: [],
      columns: [],
    },
  },
  tenantSettings: {
    user: 1,
    tenant: 0,
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
      name: 'Receipt',
      generateUI: true,
      generateController: true,
      generateModel: true,
      generateMigration: true,
      defaultColumn: 'Name',
      timestamps: true,
      generateRoute: true,
      singleton: false,
      routeParents: [],
      indexColumns: ['Name'],
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
      relations: [],
      columns: [
        {
          name: 'Name',
          type: 'String',
          meta: {
            required: true,
            minLength: 2,
            maxLength: 128,
            expose: true,
            filterable: true,
            sortable: true,
            trim: true,
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
          },
        },
        {
          name: 'Description',
          type: 'String',
          meta: {
            required: false,
            multiline: true,
            maxLength: 4096,
            expose: true,
            filterable: false,
            sortable: false,
            trim: true,
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
          },
        },
        {
          name: 'SelectStringString',
          type: 'String',
          meta: {
            required: true,
            minLength: 2,
            maxLength: 128,
            expose: true,
            filterable: false,
            sortable: false,
            trim: true,
          },
          input: {
            type: 'Select',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: ['One', 'Two', 'Three', 'Four', 'Five'],
            },
          },
        },
        {
          name: 'SelectStringKeyValue',
          type: 'String',
          meta: {
            required: true,
            minLength: 2,
            maxLength: 128,
            expose: true,
            filterable: false,
            sortable: false,
            trim: true,
          },
          input: {
            type: 'Select',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'KV',
              options: [
                {
                  value: 'One',
                  label: '1',
                },
                {
                  value: 'Two',
                  label: '2',
                },
                {
                  value: 'Three',
                  label: '3',
                },
                {
                  value: 'Four',
                  label: '4',
                },
              ],
            },
          },
        },
        {
          name: 'Decimal',
          type: 'Decimal',
          meta: {
            required: true,
            min: 0,
            max: 100,
            expose: true,
            filterable: false,
            sortable: true,
            trim: false,
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
          },
        },
        {
          name: 'DecimalString',
          type: 'Decimal',
          meta: {
            required: true,
            min: 0,
            max: 100,
            expose: true,
            filterable: false,
            sortable: false,
            trim: false,
          },
          input: {
            type: 'Select',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
            },
          },
        },
        {
          name: 'DecimalKeyValue',
          type: 'Decimal',
          meta: {
            required: true,
            min: 0,
            max: 100,
            expose: true,
            filterable: false,
            sortable: true,
            trim: false,
          },
          input: {
            type: 'Select',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'KV',
              options: [
                {
                  value: '10',
                  label: 'Ten',
                },
                {
                  value: '20',
                  label: 'Twenty',
                },
                {
                  value: '30',
                  label: 'Thirty',
                },
                {
                  value: '40',
                  label: 'Fourty',
                },
              ],
            },
          },
        },
        {
          meta: {
            required: true,
            expose: true,
            filterable: false,
            sortable: true,
            trim: false,
            min: '0',
            max: '100',
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
          type: 'Integer',
          name: 'Integer',
        },
        {
          meta: {
            required: true,
            expose: true,
            filterable: true,
            sortable: false,
            trim: false,
            min: '0',
            max: '100',
          },
          input: {
            type: 'Select',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'String',
              options: ['1', '2', '3', '4', '5'],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'IntegerString',
          type: 'Integer',
        },
        {
          meta: {
            required: true,
            expose: true,
            filterable: false,
            sortable: true,
            trim: false,
            min: '0',
            max: '100',
          },
          input: {
            type: 'Select',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'KV',
              options: [
                {
                  value: '1',
                  label: 'One',
                },
                {
                  value: '2',
                  label: 'Two',
                },
                {
                  value: '3',
                  label: 'Three',
                },
                {
                  value: '4',
                  label: 'Four',
                },
                {
                  value: '5',
                  label: 'Five',
                },
              ],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'IntegerKeyValue',
          type: 'Integer',
        },
        {
          meta: {
            required: true,
            expose: true,
            filterable: true,
            sortable: false,
            trim: false,
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
          type: 'Date',
          name: 'Date',
        },
        {
          meta: {
            required: true,
            expose: true,
            filterable: false,
            sortable: false,
            trim: false,
          },
          input: {
            type: 'Switch',
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
          type: 'Boolean',
          name: 'ToggleSwitch',
        },
        {
          meta: {
            required: true,
            expose: true,
            filterable: true,
            sortable: false,
            trim: false,
          },
          input: {
            type: 'Checkbox',
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
          name: 'ToggleCheckbox',
          type: 'Boolean',
        },
      ],
    },
  ],
}
