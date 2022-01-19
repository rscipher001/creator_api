import Env from '@ioc:Adonis/Core/Env'
import SystemService from 'App/Services/SystemService'
import ProjectInput from 'App/Interfaces/ProjectInput'
import HostingService from 'App/Services/HostingService'
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

  public async test() {
    if (Env.get('NODE_ENV') !== 'development') return 'Only available in developmnt envionment'
    const input = {
      hosting: {
        databaseName: 'testa',
        databaseUser: 'testa',
        databasePassword: 'testa',
      },
    }
    const hostingService = new HostingService(input as ProjectInput)
    hostingService.init()
    return 'Done'
  }
}
