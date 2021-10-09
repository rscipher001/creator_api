import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class EnsureEmailIsVerified {
  public async handle ({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    const user = auth.user!
    if (!user.emailVerifiedAt) {
      return response.forbidden('Email verification is pending')
    }
    await next()
  }
}
