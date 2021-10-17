import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import Mail from '@ioc:Adonis/Addons/Mail'
import Encryption from '@ioc:Adonis/Core/Encryption'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'
import VerificationToken, { Reason } from 'App/Models/VerificationToken'

export default class PasswordResetController {
  public async sendResetEmail({ request }: HttpContextContract) {
    const email = await request.input('email')
    const user = await User.findBy('email', email)
    if (user) {
      const encryptedEmail = Encryption.encrypt(email)
      const resetToken = await VerificationToken.firstOrCreate(
        { email },
        {
          email,
          token: VerificationToken.generateToken(),
          reason: Reason.passwordReset,
        }
      )
      await Mail.sendLater((message) => {
        message
          .to(resetToken.email)
          .from(Env.get('MAIL_FROM_ADDRESS'))
          .subject('Password reset mail')
          .htmlView('emails/passwordReset', {
            user,
            url: `${Env.get('UI_URL')}/forgot_password/verify?token=${
              resetToken.token
            }&email=${encryptedEmail}`,
          })
      })
    }
    return 'If your email is registered then password reset email is sent successfully'
  }

  public async verifyToken({ request }: HttpContextContract) {
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
    await VerificationToken.query()
      .where({ token, email, reason: Reason.passwordReset })
      .firstOrFail()
    return 'Reset token is valid'
  }

  public async updatePassword({ request }: HttpContextContract) {
    const tokenVerificationScheam = schema.create({
      email: schema.string({ trim: true }, [rules.email(), rules.maxLength(128)]),
      token: schema.string({ trim: true }, [rules.maxLength(128), rules.minLength(128)]),
      password: schema.string({ trim: true }, [
        rules.maxLength(64),
        rules.confirmed('passwordConfirmation'),
      ]),
    })
    const input = {
      email: Encryption.decrypt(request.input('email')),
      token: request.input('token'),
      password: request.input('password'),
      passwordConfirmation: request.input('passwordConfirmation'),
    }
    const { token, email, password } = await validator.validate({
      schema: tokenVerificationScheam,
      data: input,
    })
    const verificationToken = await VerificationToken.query()
      .where({ token, email, reason: Reason.passwordReset })
      .firstOrFail()
    const user = await User.findByOrFail('email', email)
    user.password = password
    await Promise.all([user.save(), verificationToken.delete()])
    return 'Password changed successfully'
  }
}
