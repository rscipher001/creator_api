import SystemService from 'App/Services/SystemService'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PagesController {
  public async status(_: HttpContextContract) {
    return SystemService.ensureGeneratorToolsAreInstalled()
  }
}
