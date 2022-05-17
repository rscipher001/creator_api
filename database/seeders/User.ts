import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
export default class UserSeeder extends BaseSeeder {
  public async run() {
    if (Env.get('NODE_ENV') === 'test') {
      await User.firstOrCreate(
        {
          email: 'john@example.com',
        },
        {
          name: 'John Doe',
          email: 'john@example.com',
          emailVerifiedAt: DateTime.now(),
          password: 'john@example.com',
        }
      )
    }
  }
}
