import Hash from '@ioc:Adonis/Core/Hash'
import ProfileValidator from 'App/Validators/ProfileValidator'
import AccountValidator from 'App/Validators/AccountValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ChangePasswordValidator from 'App/Validators/ChangePasswordValidator'

export default class ProfileController {
  public async updateProfile({ auth, request }: HttpContextContract) {
    const user = auth.user!
    const input = await request.validate(ProfileValidator)
    return user.merge(input).save()
  }

  public async updateAccount({ auth, request }: HttpContextContract) {
    const user = auth.user!
    const input = await request.validate(AccountValidator)

    user.merge(input)
    if (user.$dirty.email) {
      /**
       * TOOD: Optional Steps to send an email for email validation
       * And mark new email as unverified
       */
      user.emailVerifiedAt = undefined
    }
    return user.save()
  }

  /**
   * Update password and logout from all other devices
   */
  public async updatePassword({ auth, request, response }: HttpContextContract) {
    const user = auth.user!
    const { oldPassword, newPassword } = await request.validate(ChangePasswordValidator)
    const matched = await Hash.verify(user.password, oldPassword)
    if (!matched) {
      response.abort('Old password is wrong', 400)
    }

    user.password = newPassword
    await user.save()
    return 'Password updated successfully'
  }
}
