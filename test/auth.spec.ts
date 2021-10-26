import test from 'japa'
import faker from 'faker'
import supertest from 'supertest'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import Encryption from '@ioc:Adonis/Core/Encryption'

const BASE_URL = `http://${Env.get('HOST')}:${Env.get('PORT')}`

const fulProjectInput = {
  name: 'CIFullAPITest',
  database: 'mysql',
  types: ['api'],
  mailers: ['smtp'],
  defaultMailer: 'smtp',
  storageDrivers: ['local'],
  defaultStorageDriver: 'local',
  camelCaseStrategy: true,
  tech: {
    backend: 'adonis',
    frontend: 'buefy',
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
    passwordReset: true,
    passwordChange: true,
    table: {
      operations: [],
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
      indexColumns: ['name', 'isoCode'],
      operations: ['index', 'store', 'update', 'destroy', 'storeMany', 'destroyMany'],
      columns: [
        {
          meta: {
            required: true,
            expose: true,
            trim: true,
            minLength: '2',
            maxLength: '127',
            dbLength: '',
          },
          input: {
            type: 'input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            radio: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'name',
          type: 'string',
        },
        {
          meta: {
            displayName: 'ISO Code',
            required: true,
            expose: true,
            trim: true,
            minLength: '3',
            maxLength: '3',
            dbLength: '',
          },
          input: {
            type: 'input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            radio: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'isoCode',
          type: 'string',
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
      operations: ['index', 'store', 'update', 'destroy', 'storeMany', 'destroyMany'],
      columns: [
        {
          meta: {
            required: true,
            expose: true,
            trim: true,
            minLength: '2',
            maxLength: '127',
          },
          input: {
            type: 'input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            radio: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'name',
          type: 'string',
        },
        {
          meta: {
            required: true,
            expose: true,
            trim: true,
            minLength: '3',
            maxLength: '3',
          },
          input: {
            type: 'input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            radio: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'isoCode',
          type: 'string',
        },
      ],
      relations: [
        {
          type: 'belongsTo',
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
      operations: ['index', 'store', 'show', 'update', 'destroy', 'storeMany', 'destroyMany'],
      columns: [
        {
          meta: {
            required: true,
            expose: true,
            trim: true,
            minLength: '25',
            maxLength: '512',
            multiline: true,
          },
          input: {
            type: 'input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            radio: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'address',
          type: 'string',
        },
      ],
      relations: [
        {
          type: 'belongsTo',
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
      operations: ['index', 'store', 'show', 'update', 'destroy', 'storeMany', 'destroyMany'],
      columns: [
        {
          meta: {
            required: true,
            expose: true,
            trim: true,
            minLength: '2',
            maxLength: '127',
          },
          input: {
            type: 'input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            radio: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'name',
          type: 'string',
        },
      ],
      relations: [
        {
          type: 'manyToMany',
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
      operations: ['index', 'store', 'show', 'update', 'destroy', 'storeMany', 'destroyMany'],
      columns: [
        {
          meta: {
            required: true,
            expose: true,
            trim: true,
            minLength: '2',
            maxLength: '127',
          },
          input: {
            type: 'input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            radio: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'name',
          type: 'string',
        },
      ],
      relations: [
        {
          type: 'manyToMany',
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
      operations: ['index', 'store', 'show', 'update', 'destroy', 'storeMany', 'destroyMany'],
      columns: [
        {
          meta: {
            required: true,
            expose: true,
            trim: true,
            minLength: '25',
            maxLength: '512',
            multiline: true,
          },
          input: {
            type: 'input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            radio: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'address',
          type: 'string',
        },
      ],
      relations: [
        {
          type: 'belongsTo',
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
      operations: ['index', 'store', 'show', 'update', 'destroy', 'storeMany', 'destroyMany'],
      columns: [
        {
          meta: {
            required: true,
            expose: true,
            trim: true,
            minLength: '25',
            maxLength: '512',
            multiline: true,
          },
          input: {
            type: 'input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            radio: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'address',
          type: 'string',
        },
      ],
      relations: [
        {
          type: 'belongsTo',
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
      operations: ['index', 'store', 'show', 'update', 'destroy', 'storeMany', 'destroyMany'],
      columns: [
        {
          meta: {
            required: true,
            expose: true,
            trim: true,
            minLength: '25',
            maxLength: '512',
            multiline: true,
          },
          input: {
            type: 'input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            radio: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'address',
          type: 'string',
        },
      ],
      relations: [
        {
          type: 'belongsTo',
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
      operations: ['store', 'show', 'destroy'],
      columns: [
        {
          meta: {
            required: true,
            expose: true,
            trim: true,
            minLength: '25',
            maxLength: '512',
            multiline: true,
          },
          input: {
            type: 'input',
            decimal: {
              step: 'any',
            },
            select: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            radio: {
              types: ['object', 'string', 'number'],
              type: 'string',
              options: [],
            },
            checkbox: {
              options: [],
            },
          },
          name: 'address',
          type: 'string',
        },
      ],
      relations: [
        {
          type: 'belongsTo',
          withModel: 'Subtask',
          name: '',
          required: true,
        },
      ],
    },
  ],
}

test.group('Auth', (group) => {
  group.before(async () => {
    await Database.beginGlobalTransaction()
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  const user = {
    email: faker.internet.email(),
    password: 'secret@123',
    name: faker.lorem.word(),
    rememberMeToken: faker.lorem.word(),
    emailVerifiedAt: faker.date.past(),
  }

  let token: string

  test('Ping', async (assert) => {
    const { body } = await supertest(BASE_URL).get('/').expect(200)
    assert.equal(body.hello, 'world')
  })

  test('Register', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/api/register')
      .send({
        ...user,
        passwordConfirmation: user.password,
      })
      .expect(200)
    assert.isString(body.token)
    assert.isObject(body.user)
    assert.equal(body.user.email, user.email)
  })

  /**
   * Temporary until Mail trapping is completed
   */
  test('Verify email', async (assert) => {
    const token = await Database.from('verificationTokens').where({ email: user.email }).first()
    const { body } = await supertest(BASE_URL)
      .post('/api/email/verify')
      .send({
        email: Encryption.encrypt(user.email),
        token: token.token,
      })
      .expect(200)
    assert.isObject(body)
  })

  test('Login', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/api/login')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200)
    token = body.token
    assert.isString(body.token)
    assert.isObject(body.user)

    assert.equal(body.user.email, user.email)
  })

  test('Login Validation', async () => {
    await supertest(BASE_URL).post('/api/login').send().expect(422)
  })

  test('Me', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    assert.isObject(body)
  })

  test('Me Unauthorized', async (assert) => {
    const { body } = await supertest(BASE_URL).get('/api/me').expect(401)
    assert.isObject(body)
  })

  test('Generate plain project API Part - 1', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/api/project')
      .send(fulProjectInput)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    assert.isObject(body)
  })

  test('Generate plain project API Part - 2', async (assert) => {
    let shouldCheckAgain = true
    while (shouldCheckAgain) {
      const { body } = await supertest(BASE_URL)
        .get('/api/project/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      if (body.status === 'failed') throw new Error('Project creation failed')
      if (body.status === 'done') {
        shouldCheckAgain = false
        assert.isObject(body)
      }
    }
  }).timeout(600000)
})
