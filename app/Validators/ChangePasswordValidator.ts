import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ChangePasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    oldPassword: schema.string({ trim: true }, [rules.maxLength(64)]),
    newPassword: schema.string({ trim: true }, [
      rules.maxLength(64),
      rules.confirmed('newPasswordConfirmation'),
    ]),
  })
}
