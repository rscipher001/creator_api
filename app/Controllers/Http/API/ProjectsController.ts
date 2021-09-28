import Env from '@ioc:Adonis/Core/Env'
import Project from 'App/Models/Project'
import Route from '@ioc:Adonis/Core/Route'
import Generator from 'App/Services/ProjectService'
import HelperService from 'App/Services/HelperService'
import Application from '@ioc:Adonis/Core/Application'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateProjectValidator from 'App/Validators/CreateProjectValidator'

export default class ProjectsController {
  public async index({ request, auth }: HttpContextContract) {
    const page = request.input('page_no', 1)
    const limit = request.input('page_size', 10)

    return Project.query().where('userId', auth.user!.id).paginate(page, limit)
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

  public async generateSignedUrl({ request, auth }) {
    const projectId = request.param('projectId')
    const type = request.param('type')
    const project = await Project.query()
      .where({
        userId: auth.user!.id,
        id: projectId,
      })
      .firstOrFail()
    if (!project) throw new Error('Project not found')
    if (project.status === 'queued') throw new Error('Build is in progress')
    if (project.status === 'failed') throw new Error('Build failed')
    return Route.makeSignedUrl('projectDownload', {
      projectId, type,
    })
  }

  public async download({ request, response }: HttpContextContract) {
    if (!request.hasValidSignature()) {
      throw new Error('Signature is invalid');
    }
    const id = request.param('projectId')
    const type = request.param('type')
    const project = await Project.findOrFail(id)
    const input = JSON.parse(project.rawInput)
    const basePath = Application.makePath(Env.get('PROJECT_PATH'))
    const names = HelperService.generateExtendedNames(input.name)
    const apiPath = `${basePath}/${names.dashCase}`
    // const uiPath = `${basePath}/${names.dashCase}-spa`

    if (type === 'api') {
      await HelperService.execute('git', ['archive', '--format', 'zip', '--output', 'api.zip', 'master'], {
        cwd: apiPath
      });
      return response.download(`${apiPath}/api.zip`, true)
    }
    if (type === 'web') {
      // Generate a zip for API folder
      // Download it
    }
  }

  protected async generateProject(input, project: Project) {
    try {
      const generator = new Generator(input, project.id)
      await generator.init()
      project.status = 'done'
      await project.save()
      // Send an email or something
    } catch (e) {
      const basePath = Application.makePath(Env.get('PROJECT_PATH'))
      const names = HelperService.generateExtendedNames(input.name)
      const apiPath = `${basePath}/${names.dashCase}`
      const uiPath = `${basePath}/${names.dashCase}-spa`
      try {
        await HelperService.execute('rm', ['-rf', apiPath, uiPath], {
          cwd: basePath,
        })
      } catch (e) {}
      project.status = 'failed'
      await project.save()
      console.error(e)
    }
  }
}
