import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import { HostingPorts } from 'App/Interfaces/Enums'
import Application from '@ioc:Adonis/Core/Application'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'
import BackendProjectService from 'App/Services/ProjectService'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public rawInput: string

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

  // Frontend URL when hosted
  @column({
    serialize: (value) =>
      Env.get('HOSTING_UI_DOMAIN')
        ? `https://${Env.get('HOSTING_UI_DOMAIN')}:${HostingPorts.nginxUi}/${value}`
        : null,
  })
  public url: string

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

  public async getProjectInput() {
    if (this.projectInput) return this.projectInput
    const generator = new BackendProjectService(JSON.parse(this.rawInput), this.id)
    this.projectInput = generator.prepare()
    await this.save()
    return this.projectInput
  }
}
