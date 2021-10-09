import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import Mail from '@ioc:Adonis/Addons/Mail'
import Encryption from '@ioc:Adonis/Core/Encryption'
import LoginValidator from 'App/Validators/LoginValidator'
import VerificationToken from 'App/Models/VerificationToken'
import RegisterValidator from 'App/Validators/RegisterValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
  public async login({ request, auth }: HttpContextContract) {
    const { email, password } = await request.validate(LoginValidator)
    const token = await auth.use('api').attempt(email, password)
    const { token: tokenString } = token.toJSON()
    const user = auth.user!!

    return {
      token: tokenString,
      user: user,
    }
  }

  public async register({ request, auth }: HttpContextContract) {
    const input = await request.validate(RegisterValidator)
    const user = await User.create(input)
    const token = await auth.use('api').login(user)
    const { token: tokenString } = token.toJSON()

    const tokenQuery = { email: input.email }
    const payload = {
      email: input.email,
      token: VerificationToken.generateToken(),
    }
    const encryptedEmail = Encryption.encrypt(input.email)
    const verificationToken = await VerificationToken.firstOrCreate(tokenQuery, payload)
    await Mail.sendLater((message) => {
      message
        .to(verificationToken.email)
        .from(Env.get('MAIL_FROM_ADDRESS'))
        .subject('Verify your email')
        .htmlView('emails/emailVerification', {
          user,
          url: `${Env.get('UI_URL')}/email/verify?token=${
            verificationToken.token
          }&email=${encryptedEmail}`,
        })
    })

    return {
      token: tokenString,
      user,
    }
  }

  public async logout({ auth }: HttpContextContract) {
    await auth.use('api').revoke()
    return 'You have been logged out'
  }

  public async me({ auth }: HttpContextContract) {
    return auth.user
  }
}
