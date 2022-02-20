import SystemService from 'App/Services/SystemService'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PagesController {
  public async status({ request, view }: HttpContextContract) {
    const status = await SystemService.systemStatus()
    switch (request.accepts(['html', 'text/html', 'json'])) {
      case 'html':
      case 'text/html':
        return view.render('status', {
          status,
        })
      case 'json':
        return status
      default:
        return view.render('status', {
          status,
        })
    }
  }
}
