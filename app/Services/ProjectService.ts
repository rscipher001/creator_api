import Project from 'App/Models/Project'
import Logger from '@ioc:Adonis/Core/Logger'
import GeneratorService from './GeneratorService'

class ProjectService {
  public async generateProjectj(projectId: number) {
    Logger.info(`${projectId} is being generated`)
    const project = await Project.query().where('id', projectId).first()
    if (!project) return
    const generator = new GeneratorService(project.rawInput, project.id)
    await generator.init()
    project.status = 'done'
    project.projectInput = generator.projectInput
    await project.save()
  }
}

export default new ProjectService()
