import Env from '@ioc:Adonis/Core/Env'
import Hash from '@ioc:Adonis/Core/Hash'
import Mail from '@ioc:Adonis/Addons/Mail'
import Drive from '@ioc:Adonis/Core/Drive'
import Database from '@ioc:Adonis/Lucid/Database'
import Encryption from '@ioc:Adonis/Core/Encryption'
import Application from '@ioc:Adonis/Core/Application'
import ProfileValidator from 'App/Validators/ProfileValidator'
import AccountValidator from 'App/Validators/AccountValidator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import VerificationToken, { Reason } from 'App/Models/VerificationToken'
import ChangePasswordValidator from 'App/Validators/ChangePasswordValidator'
export default class ProfileController {
  public async updateProfile({ auth, request }: HttpContextContract) {
    const user = auth.user!
    const input = await request.validate(ProfileValidator)
    return user.merge(input).save()
  }

  /**
   * Returns existing update account requests
   */
  public async getAccount({ auth }: HttpContextContract) {
    const user = auth.user!
    return VerificationToken.query()
      .where({ userId: user.id, reason: Reason.emailUpdate })
      .firstOrFail()
  }

  /**
   * Delete update email request
   */
  public async deleteAccount({ auth }: HttpContextContract) {
    return VerificationToken.query()
      .where({ userId: auth.user!.id, reason: Reason.emailUpdate })
      .delete()
  }

  /**
   * Sends a verification email,
   * Account is only updated if email is verified
   */
  public async updateAccount({ auth, request, response }: HttpContextContract) {
    const user = auth.user!
    const { email: newEmail } = await request.validate(AccountValidator)
    if (newEmail !== user.email) {
      const encryptedEmail = Encryption.encrypt(newEmail)
      const existingVerificationToken = await VerificationToken.query()
        .where({
          reason: Reason.emailUpdate,
          userId: user.id,
        })
        .first()
      if (existingVerificationToken) {
        return response.badRequest('Previous email update request is pending')
      }
      const verificationToken = await VerificationToken.firstOrCreate(
        { email: newEmail },
        {
          email: newEmail,
          token: VerificationToken.generateToken(),
          reason: Reason.emailUpdate,
          userId: user.id,
        }
      )
      await Mail.sendLater((message) => {
        message
          .to(verificationToken.email)
          .from(Env.get('MAIL_FROM_ADDRESS'))
          .subject('Email Update')
          .htmlView('emails/emailUpdate', {
            user,
            url: `${Env.get('UI_URL')}/emailUpdate?token=${
              verificationToken.token
            }&email=${encryptedEmail}`,
          })
      })
    }
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

    // revoke other tokens
    const id: number = auth.use('api').token!.meta!.id
    await Database.from('api_tokens').where('user_id', auth.user!.id).whereNot('id', id).delete()

    return 'Password updated successfully'
  }

  public async updateAvatar({ auth, request, response }: HttpContextContract) {
    const user = auth.user!
    const avatar = request.file('avatar', {
      size: '1mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })
    if (!avatar) {
      return response.badRequest('Image not found')
    }
    await avatar.move(Application.publicPath('uploads'))
    user.avatar = '/uploads/' + avatar.fileName
    await user.save()
    return user
  }
}
