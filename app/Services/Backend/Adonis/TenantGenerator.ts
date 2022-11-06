import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'

export default class TenantGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  protected async extendRequest() {
    const filePath = `${this.input.path}/contracts/request.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/contracts/requestTs`,
        {
          input: this.input,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  protected async createTenantAuthMiddleware() {
    const filePath = `${this.input.path}/app/Middleware/TenantAuth.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Middleware/tenantAuthTs`,
        {
          input: this.input,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  /**
   * Steps
   * 1. Process CRUD operation for tenant
   * 2. Extend request
   */
  protected async start() {
    await this.extendRequest()
    await this.createTenantAuthMiddleware()
    await HelperService.commit('Tenant support added', this.input.path)
  }

  public async init() {
    await this.start()
  }
}
