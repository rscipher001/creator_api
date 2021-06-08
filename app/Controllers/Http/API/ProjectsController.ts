import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BackendGenerator from 'App/Services/ProjectService'
// import Project from 'App/Models/Project'

export default class ProjectsController {
  public async generate({ request }: HttpContextContract) {
    const input = request.body()
    const backendGenerator = new BackendGenerator(input)
    backendGenerator.init()

    return 'Project is being generated'
  }
}
