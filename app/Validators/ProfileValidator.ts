import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class ProfileValidator {
  public schema = schema.create({
    name: schema.string({}, [rules.maxLength(127), rules.minLength(2)]),
  })
}
