import Env from '@ioc:Adonis/Core/Env'
import Project from 'App/Models/Project'
import Route from '@ioc:Adonis/Core/Route'
import Generator from 'App/Services/ProjectService'
import Application from '@ioc:Adonis/Core/Application'
import HelperService from 'App/Services/HelperService'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateProjectValidator from 'App/Validators/CreateProjectValidator'

export default class ProjectsController {
  public async index({ request, auth }: HttpContextContract) {
    const page = request.input('pageNo', 1)
    const limit = request.input('pageSize', 10)
    const sortBy: string = request.input('sortBy', 'id')
    const sortType = request.input('sortType', 'desc')
    const queryBuilder = Project.query().where('userId', auth.user!.id).orderBy(sortBy, sortType)

    if (request.input('name')) {
      queryBuilder.where('name', 'like', `%${request.input('name')}%`)
    }
    if (request.input('status')) {
      queryBuilder.where('status', request.input('status'))
    }

    return queryBuilder.paginate(page, limit)
  }

  public async show({ request, auth }: HttpContextContract) {
    return Project.query()
      .where({
        userId: auth.user!.id,
        id: request.param('id'),
      })
      .first()
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const input = await request.validate(CreateProjectValidator)
    // Pre checks to ensure there is no contracitory settings
    if (input.auth.passwordReset && !input.mailEnabled) {
      return response.badRequest({
        error: 'Password reset requires mailing feature',
      })
    }
    if (input.tenantSettings.tenant && !input.tenantSettings.table) {
      return response.badRequest({
        error: 'Tenant table should be selected when tenant option is enabled',
      })
    }
    // Ensure roles have permission and there is a default role
    const project = await Project.create({
      status: 'queued',
      name: input.name,
      rawInput: JSON.stringify(input),
      userId: auth.user!.id,
    })
    this.generateProject(input, project)
    return project
  }

  public async generateDraft({ request, auth }: HttpContextContract) {
    const projectId: number = request.param('id')
    const project = await Project.query()
      .where({
        id: projectId,
        userId: auth.user!.id,
        status: 'draft',
      })
      .firstOrFail()
    this.generateProject(JSON.parse(project.rawInput), project)
    return project
  }

  public async storeDraft({ request, response, auth }: HttpContextContract) {
    const input = await request.validate(CreateProjectValidator)
    // Pre checks to ensure there is no contracitory settings
    if (input.auth.passwordReset && !input.mailEnabled) {
      return response.badRequest({
        error: 'Password reset requires mailing feature',
      })
    }
    if (input.tenantSettings.tenant && !input.tenantSettings.table) {
      return response.badRequest({
        error: 'Tenant table should be selected when tenant option is enabled',
      })
    }
    const project = await Project.create({
      status: 'draft',
      name: input.name,
      rawInput: JSON.stringify(input),
      userId: auth.user!.id,
    })
    return project
  }

  public async updateDraft({ request, response, auth }: HttpContextContract) {
    const projectId: number = request.param('id')
    const project = await Project.query()
      .where({
        id: projectId,
        userId: auth.user!.id,
        status: 'draft',
      })
      .firstOrFail()

    const input = await request.validate(CreateProjectValidator)
    // Pre checks to ensure there is no contracitory settings
    if (input.auth.passwordReset && !input.mailEnabled) {
      return response.badRequest({
        error: 'Password reset requires mailing feature',
      })
    }
    if (input.tenantSettings.tenant && !input.tenantSettings.table) {
      return response.badRequest({
        error: 'Tenant table should be selected when tenant option is enabled',
      })
    }

    project.rawInput = JSON.stringify(input)
    await project.save()
    return project
  }

  public async destroy({ request, auth, response }: HttpContextContract) {
    const projectId: number = request.param('id')
    const project = await Project.query()
      .where({
        id: projectId,
        userId: auth.user!.id,
      })
      .firstOrFail()
    await project.deleteFiles()
    await project.delete()
    return response.noContent()
  }

  public async generateSignedUrl({ request, auth }) {
    const projectId = request.param('id')
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
      projectId,
      type,
    })
  }

  public async download({ request, response }: HttpContextContract) {
    if (!request.hasValidSignature()) {
      throw new Error('Signature is invalid')
    }
    const id = request.param('id')
    const type = request.param('type')
    const project = await Project.findOrFail(id)
    const input = JSON.parse(project.rawInput)
    const basePath = Application.makePath(Env.get('PROJECT_PATH'))
    const names = HelperService.generateExtendedNames(input.name)
    const apiPath = `${basePath}/${id}-${names.dashCase}`
    const uiPath = `${basePath}/${id}-${names.dashCase}-spa`

    if (type === 'api') {
      await HelperService.execute(
        'git',
        ['archive', '--format', 'zip', '--output', 'api.zip', 'master'],
        {
          cwd: apiPath,
        }
      )
      return response.download(`${apiPath}/api.zip`, true)
    }
    if (type === 'spa') {
      await HelperService.execute(
        'git',
        ['archive', '--format', 'zip', '--output', 'spa.zip', 'master'],
        {
          cwd: uiPath,
        }
      )
      return response.download(`${uiPath}/spa.zip`, true)
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
