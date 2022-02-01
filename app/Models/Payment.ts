import { DateTime } from 'luxon'
import User from 'App/Models/User'
import { PaymentStatus } from 'App/Interfaces/Enums'
import { StripePaymentIntent } from 'App/Interfaces/ProjectInput'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public status: PaymentStatus

  @column()
  public stripe: StripePaymentIntent

  @column()
  public userId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
