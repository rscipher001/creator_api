import User from 'App/Models/User'
import { test } from '@japa/runner'
import codeOne from './input/codeOne'
import codeTwo from './input/codeTwo'
import codeThree from './input/codeThree'
import Logger from '@ioc:Adonis/Core/Logger'
import Database from '@ioc:Adonis/Lucid/Database'
import HelperService from 'App/Services/HelperService'

const testCases = {
  codeOne,
  codeTwo,
  codeThree,
}
test.group('Project', async (group) => {
  Logger.info('Started testing project')
  const user = await User.findByOrFail('email', 'john@example.com')

  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('Get paginated list of projects', async ({ client }) => {
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

  for (const [name, input] of Object.entries(testCases)) {
    test(`Create ${name}`, async ({ client }) => {
      const storeResponse = await client
        .post('/api/project')
        .guard('api')
        .loginAs(user as never)
        .json(input)

      storeResponse.assertStatus(200)
      const projectId: number = storeResponse.body().id

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
          if (codeOne.generate.api.generate) {
            try {
              await HelperService.execute('npm', ['run', 'build'], {
                cwd: body.projectInput.path,
              })
            } catch (_) {
              throw new Error('API build is failing')
            }
          }
          if (codeOne.generate.spa.generate) {
            try {
              await HelperService.execute('npm', ['run', 'build'], {
                cwd: body.projectInput.spaPath,
              })
            } catch (_) {
              throw new Error('UI build is failing')
            }
          }
          showResponse.assertStatus(200)
        }
      }
    }).timeout(600000)
  }
})
