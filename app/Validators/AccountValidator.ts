import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AccountValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.maxLength(127),
      rules.unique({
        table: User.table,
        column: 'email',
        whereNot: {
          id: this.ctx.auth.user!.id,
        },
      }),
    ]),
  })
}
