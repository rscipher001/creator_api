import { DateTime } from 'luxon'
import Env from '@ioc:Adonis/Core/Env'
import Application from '@ioc:Adonis/Core/Application'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({
    prepare: (v) => JSON.stringify(v),
    consume: (v) => JSON.parse(v),
  })
  public rawInput: { [key: string]: any }

  @column({
    prepare: (v) => JSON.stringify(v),
    consume: (v) => JSON.parse(v),
  })
  public projectInput: ProjectInput

  @column()
  public name: string

  @column()
  public status: string

  @column()
  public isHosted: boolean

  // Source code deleted
  @column()
  public isDeleted: boolean

  // node_modules deleted
  @column()
  public isCleaned: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public userId: number

  public async deleteFiles() {
    const basePath = Application.makePath(Env.get('PROJECT_PATH'))
    const names = HelperService.generateExtendedNames(this.rawInput.name)
    const apiPath = `${basePath}/${names.dashCase}`
    const uiPath = `${basePath}/${names.dashCase}-spa`
    try {
      await HelperService.execute('rm', ['-rf', apiPath, uiPath], {
        cwd: basePath,
      })
    } catch (e) {}
  }
}
