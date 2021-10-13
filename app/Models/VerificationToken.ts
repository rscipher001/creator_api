import crypto from 'crypto'
import { DateTime } from 'luxon'
import User from 'App/Models/User'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'

export enum Reason {
  emailVerification = 'emailVerification', // For email verification during registration
  emailUpdate = 'emailUpdate', // For email update from settings
  passwordReset = 'passwordReset', // For forgot password usecases
}

export default class VerificationToken extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public token: string

  @column()
  public reason: Reason // email_verification, password_reset, email_update

  @column()
  public userId?: number | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  public static generateToken() {
    return crypto.randomBytes(64).toString('hex')
  }
}
