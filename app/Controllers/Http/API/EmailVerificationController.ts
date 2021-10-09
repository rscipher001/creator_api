import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Encryption from '@ioc:Adonis/Core/Encryption'
import VerificationToken from 'App/Models/VerificationToken'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'

export default class EmailVerificationController {
  public async verifyEmail({ request }: HttpContextContract) {
    const tokenVerificationScheam = schema.create({
      email: schema.string({ trim: true }, [rules.email(), rules.maxLength(128)]),
      token: schema.string({ trim: true }, [rules.maxLength(128), rules.minLength(128)]),
    })
    const input = {
      email: Encryption.decrypt(request.input('email')),
      token: request.input('token'),
    }
    const { token, email } = await validator.validate({
      schema: tokenVerificationScheam,
      data: input,
    })
    const verificationToken = await VerificationToken.query().where({ token, email }).firstOrFail()
    const user = await User.findByOrFail('email', email)
    user.emailVerifiedAt = DateTime.now()
    await user.save()
    await verificationToken.delete()
    return 'Email verified successfully'
  }
}
