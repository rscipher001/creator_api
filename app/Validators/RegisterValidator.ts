import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class RegisterValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.maxLength(127), rules.minLength(2)]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.maxLength(127),
      rules.unique({
        table: User.table,
        column: 'email',
      }),
    ]),
    password: schema.string({ trim: true }, [
      rules.maxLength(64),
      rules.confirmed('passwordConfirmation'),
    ]),
  })

  public messages = {}
}
