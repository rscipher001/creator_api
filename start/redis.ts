import Logger from '@ioc:Adonis/Core/Logger'
import Redis from '@ioc:Adonis/Addons/Redis'
import ProjectService from 'App/Services/ProjectService'

Redis.subscribe('project:created', async (projectIdString: string) => {
  try {
    const projectId = parseInt(projectIdString, 10)
    await ProjectService.generateProjectj(projectId)
  } catch (e) {
    Logger.fatal('Error generating project', e)
  }
})
