import test from 'japa'
import faker from '@faker-js/faker'
import supertest from 'supertest'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import Encryption from '@ioc:Adonis/Core/Encryption'
import ProjectInput from 'App/Interfaces/ProjectInput'
import HelperService from 'App/Services/HelperService'

import fullProjectInput from './input/full'
import oneTableMin from './input/oneTableMin'
import nestedRoutes from './input/nestedRoutes'
import Project from 'App/Models/Project'

const BASE_URL = `http://${Env.get('HOST')}:${Env.get('PORT')}`
let projectId = 1
let oneTableMinProjectId = 1
let nestedRoutesProjectId = 1

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

  test('Full Project API - 1', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/api/project')
      .send(fullProjectInput)
      .set('Authorization', `Bearer ${token}`)
    // .expect(200)
    console.log({ body })
    assert.isObject(body)
    projectId = body.id
  })

  test('One Table Min API - 1', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/api/project')
      .send(oneTableMin)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    assert.isObject(body)
    oneTableMinProjectId = body.id
  })

  test('Nested Routes API - 1', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/api/project')
      .send(nestedRoutes)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    assert.isObject(body)
    nestedRoutesProjectId = body.id
  })

  test('Full Project API - 2', async (assert) => {
    let shouldCheckAgain = true
    while (shouldCheckAgain) {
      const { body }: { body: Project } = await supertest(BASE_URL)
        .get(`/api/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      if (body.status === 'failed') throw new Error('Project creation failed')
      if (body.status === 'done') {
        shouldCheckAgain = false
        await HelperService.execute('npm', ['run', 'build'], {
          cwd: body.projectInput.path,
        })
        assert.isObject(body)
      }
    }
  }).timeout(600000)

  test('One Table Min API - 2', async (assert) => {
    let shouldCheckAgain = true
    while (shouldCheckAgain) {
      const { body }: { body: Project } = await supertest(BASE_URL)
        .get(`/api/project/${oneTableMinProjectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      if (body.status === 'failed') throw new Error('Project creation failed')
      if (body.status === 'done') {
        shouldCheckAgain = false
        const prepareInput: ProjectInput = body.projectInput
        await HelperService.execute('npm', ['run', 'build'], {
          cwd: prepareInput.path,
        })
        assert.isObject(body)
      }
    }
  }).timeout(600000)

  test('Nested Routes API - 2', async (assert) => {
    let shouldCheckAgain = true
    while (shouldCheckAgain) {
      const { body }: { body: Project } = await supertest(BASE_URL)
        .get(`/api/project/${nestedRoutesProjectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      if (body.status === 'failed') throw new Error('Project creation failed')
      if (body.status === 'done') {
        shouldCheckAgain = false
        await HelperService.execute('npm', ['run', 'build'], {
          cwd: body.projectInput.path,
        })
        assert.isObject(body)
      }
    }
  }).timeout(600000)
})
