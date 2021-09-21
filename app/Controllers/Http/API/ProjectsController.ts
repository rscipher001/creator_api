import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Generator from 'App/Services/ProjectService'
import Project from 'App/Models/Project'
import CreateProjectValidator from 'App/Validators/CreateProjectValidator'

export default class ProjectsController {
  public async index({ auth }: HttpContextContract) {
    return Project.query().where('userId', auth.user!.id)
  }

  public async store({ request, auth }: HttpContextContract) {
    const input = await request.validate(CreateProjectValidator)
    const project = await Project.create({
      status: 'queued',
      rawInput: JSON.stringify(input),
      userId: auth.user!.id,
    })
    this.generateProject(input, project)
    return project
  }

  protected async generateProject(input, project: Project) {
    try {
      const generator = new Generator(input)
      await generator.init()
      project.status = 'done'
      await project.save()
      // Send an email or something
    } catch (e) {
      // Delete project files or something to undo the process
      project.status = 'error'
      await project.save()
      console.error(e)
    }
  }
}
