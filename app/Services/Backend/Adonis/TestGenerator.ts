import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'

export default class TestGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  // Create auth tests file
  protected async copyAuthTests() {
    const filePath = `${this.input.path}/tests/auth.spec.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/test/authSpecTs`,
        { input: this.input }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create .env.testing
  protected async copyTestEnv() {
    const filePath = `${this.input.path}/.env.testing`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      HelperService.copyFile(`${this.input.path}/.env`, `${this.input.path}/.env.testing`)
    }
  }

  /**
   * Steps
   */
  protected async start() {
    await this.copyTestEnv()
    // await this.copyAuthTests()
    await HelperService.commit('First Test added', this.input.path)
  }

  public async init() {
    await this.start()
  }
}
