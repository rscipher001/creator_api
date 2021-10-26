import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import Application from '@ioc:Adonis/Core/Application'
import HelperService from 'App/Services/HelperService'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public rawInput: string

  @column()
  public name: string

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  public async deleteFiles() {
    const basePath = Application.makePath(Env.get('PROJECT_PATH'))
    const names = HelperService.generateExtendedNames(JSON.parse(this.rawInput).name)
    const apiPath = `${basePath}/${names.dashCase}`
    const uiPath = `${basePath}/${names.dashCase}-spa`
    try {
      await HelperService.execute('rm', ['-rf', apiPath, uiPath], {
        cwd: basePath,
      })
    } catch (e) {}
  }
}
