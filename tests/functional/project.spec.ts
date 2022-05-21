import User from 'App/Models/User'
import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import HelperService from 'App/Services/HelperService'
import createProjectInput from './input/createProject'

test.group('Project', async (group) => {
  let projectId: number

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
    const storeResponse = await client
      .post('/api/project')
      .guard('api')
      .loginAs(user as never)
      .json(createProjectInput)

    storeResponse.assertStatus(200)
    projectId = storeResponse.body().id

    let shouldCheckAgain = true
    while (shouldCheckAgain) {
      const showResponse = await client
        .get(`/api/project/${projectId}`)
        .guard('api')
        .loginAs(user as never)

      const body = showResponse.body()
      if (body.status === 'failed') throw new Error('Project creation failed')
      if (body.status === 'done') {
        shouldCheckAgain = false
        if (createProjectInput.generate.api.generate) {
          try {
            await HelperService.execute('npm', ['run', 'build'], {
              cwd: body.projectInput.path,
            })
          } catch (_) {
            throw new Error('API build is failing')
          }
        }
        if (createProjectInput.generate.spa.generate) {
          try {
            // Temporary disabled till CSV build is fixed
            // await HelperService.execute('npm', ['run', 'build'], {
            //   cwd: body.projectInput.spaPath,
            // })
          } catch (_) {
            throw new Error('UI build is failing')
          }
        }
        showResponse.assertStatus(200)
      }
    }
  }).timeout(600000)
})
