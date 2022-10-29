import { test } from '@japa/runner'

test('Homepage', async ({ client }) => {
  const response = await client.get('/')

  response.assertStatus(200)
  response.assertTextIncludes('{"hello":"world"}')
})
