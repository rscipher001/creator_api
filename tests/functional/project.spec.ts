import { test } from '@japa/runner'
import User from 'App/Models/User'
import Database from '@ioc:Adonis/Lucid/Database'
// import fullProjectInput from '../../testaaa/input/full'

test.group('Project', async (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('Get paginated list of projects', async ({ client }) => {
    const user = await User.findByOrFail('email', 'john@example.com')
    const response = await client
      .get('/api/project')
      .guard('api')
      .loginAs(user as never)
    response.assertStatus(200)
    response.assertBodyContains({
      meta: { total: 0 },
      data: [],
    })
  })

  test('Create a project', async ({ client }) => {
    const user = await User.findByOrFail('email', 'john@example.com')
    const response = await client
      .post('/api/project')
      .guard('api')
      .loginAs(user as never)
      .json({
        name: 'HelloWorld',
        database: 'MySQL',
        types: ['API', 'SSR'],
        camelCaseStrategy: true,
        mailEnabled: true,
        mailers: ['SMTP', 'Mailgun', 'SES', 'SparkPost'],
        defaultMailer: 'SMTP',
        storageEnabled: true,
        storageDrivers: ['Local', 'S3', 'GCS'],
        defaultStorageDriver: 'Local',
        tech: { backend: 'Adonis', frontend: 'Buefy' },
        generate: {
          api: { generate: true, crud: true, test: true },
          spa: { generate: true, crud: true },
          app: { generate: false },
          website: { generate: false },
        },
        auth: {
          register: true,
          passwordReset: true,
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
        tenantSettings: { user: 1, tenant: 0 },
        rbac: {
          enabled: true,
          multipleRoles: false,
          roles: [
            { name: 'Admin', description: 'User with full access to everything', default: false },
            { name: 'User', description: 'Only access to read countries', default: true },
          ],
          permissions: [
            { name: 'Role:index' },
            { name: 'Role:create' },
            { name: 'Role:store' },
            { name: 'Role:show' },
            { name: 'Role:edit' },
            { name: 'Role:update' },
            { name: 'Role:destroy' },
            { name: 'Role:storeMany' },
            { name: 'Role:destroyMany' },
            { name: 'Permission:index' },
            { name: 'Permission:create' },
            { name: 'Permission:store' },
            { name: 'Permission:show' },
            { name: 'Permission:edit' },
            { name: 'Permission:update' },
            { name: 'Permission:destroy' },
            { name: 'Permission:storeMany' },
            { name: 'Permission:destroyMany' },
            { name: 'User:index' },
            { name: 'User:create' },
            { name: 'User:store' },
            { name: 'User:show' },
            { name: 'User:edit' },
            { name: 'User:update' },
            { name: 'User:destroy' },
            { name: 'User:storeMany' },
            { name: 'User:destroyMany' },
            { name: 'Country:index' },
            { name: 'Country:create' },
            { name: 'Country:store' },
            { name: 'Country:show' },
            { name: 'Country:edit' },
            { name: 'Country:update' },
            { name: 'Country:destroy' },
            { name: 'Country:storeMany' },
            { name: 'Country:destroyMany' },
          ],
          matrix: [
            {
              role: 'Admin',
              permissions: [
                'Role:index',
                'Role:create',
                'Role:store',
                'Role:show',
                'Role:edit',
                'Role:update',
                'Role:destroy',
                'Role:storeMany',
                'Role:destroyMany',
                'Permission:index',
                'Permission:create',
                'Permission:store',
                'Permission:show',
                'Permission:edit',
                'Permission:update',
                'Permission:destroy',
                'Permission:storeMany',
                'Permission:destroyMany',
                'User:index',
                'User:create',
                'User:store',
                'User:show',
                'User:edit',
                'User:update',
                'User:destroy',
                'User:storeMany',
                'User:destroyMany',
                'Country:index',
                'Country:create',
                'Country:store',
                'Country:show',
                'Country:edit',
                'Country:update',
                'Country:destroy',
                'Country:storeMany',
                'Country:destroyMany',
              ],
            },
            { role: 'User', permissions: ['Country:show', 'Country:index'] },
          ],
        },
        tables: [
          {
            name: 'Country',
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
                  multiline: false,
                  minLength: 2,
                  maxLength: 128,
                  expose: true,
                  filterable: false,
                  sortable: false,
                  trim: true,
                },
                input: {
                  type: 'Input',
                  decimal: { step: 'any' },
                  select: { types: ['object', 'string', 'number'], type: 'string', options: [] },
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
                  decimal: { step: 'any' },
                  select: { types: ['object', 'string', 'number'], type: 'string', options: [] },
                },
              },
            ],
          },
        ],
      })

    response.assertStatus(200)
  })
})