import User from 'App/Models/User'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LoginValidator from 'App/Validators/LoginValidator'
import RegisterValidator from 'App/Validators/RegisterValidator'

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
    const user = await User.create(await request.validate(RegisterValidator))
    const token = await auth.use('api').login(user)
    const { token: tokenString } = token.toJSON()
    return {
      token: tokenString,
      user,
    }
  }

  public async logout({ auth }: HttpContextContract) {
    await auth.logout()
    return 'You have been logged out'
  }

  public async me({ auth }: HttpContextContract) {
    return auth.user
  }
}
