import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'

export default class PasswordResetGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  // Create app/Models/ResetToken.ts
  protected async createModel() {
    const filePath = `${this.input.path}/app/Models/ResetToken.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Models/tokenModelTs`,
        {
          className: 'ResetToken',
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create app/Controllers/Http/Api/PasswordResetController.ts
  protected async createController() {
    const table = this.input.auth.table
    const filePath = `${this.input.path}/app/Controllers/Http/API/PasswordResetController.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const email = table.columns.find((c) => c.name === 'Email')
      const password = table.columns.find((c) => c.name === 'Password')
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Controllers/Http/API/passwordResetControllerTs`,
        {
          input: this.input,
          email,
          password,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Add start/routes.ts
  protected async addRoutes() {
    const filePath = `${this.input.path}/start/routes.ts`
    let content = await HelperService.readFile(filePath)
    const part = await View.render(
      `stubs/backend/${this.input.tech.backend}/partials/passwordResetGenerator/routesTs`,
      {
        input: this.input,
      }
    )
    content += part
    await HelperService.writeFile(filePath, content)
  }

  /**
   * Steps
   * 1. Generate Model
   * 2. Generate Controller
   * 3. Generate Route
   * 4. Migration [Will be handled by CRUD generator]
   */
  protected async start() {
    if (this.input.types.includes('api')) {
      await this.createModel()
      await this.createController()
      await this.addRoutes()
    }
    await HelperService.commit('Password reset added', this.input.path)
  }

  public async init() {
    await this.start()
  }
}
