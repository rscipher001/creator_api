import SystemService from 'App/Services/SystemService'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PagesController {
  public async status({ request, view }: HttpContextContract) {
    const status = await SystemService.systemStatus()
    switch (request.accepts(['html', 'json'])) {
      case 'json':
        return status
      case 'html':
        return view.render('status', {
          status,
        })
      default:
        return view.render('status', {
          status,
        })
    }
  }
}
