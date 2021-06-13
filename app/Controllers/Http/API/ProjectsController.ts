import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Generator from 'App/Services/ProjectService'
import Project from 'App/Models/Project'

export default class ProjectsController {
  public async index({ auth }: HttpContextContract) {
    return Project.query().where('userId', auth.user!.id)
  }

  public async store({ request, auth, logger }: HttpContextContract) {
    const input = request.body()
    this.generateProject(auth.user!.id, input)
    return 'Project is being generated'
  }

  protected async generateProject(userId: number, input) {
    try {
      const project = await Project.create({
        status: 'queued',
        rawInput: JSON.stringify(input),
        userId,
      })
      const generator = new Generator(input)
      await generator.init()
      project.status = 'done'
      await project.save()
      // Send an email or something
    } catch (e) {
      // Delete project files or something to undo the process
      console.error(e)
    }
  }
}
