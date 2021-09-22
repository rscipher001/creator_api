import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'
import mkdirp from 'mkdirp'

export default class CRUDGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  // Create japaFile.ts
  protected async createJapaFile() {
    const filePath = `${this.input.path}/japaFile.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(`stubs/backend/${this.input.tech.backend}/full/japaFileTs`)
      await HelperService.writeFile(filePath, content)
    }
  }

  // Update package.json
  protected async updatePackageJson() {
    const command = 'node -r @adonisjs/assembler/build/register japaFile.ts'
    const filePath = `${this.input.path}/package.json`
    const content = await HelperService.readJson(filePath)
    content.scripts.test = command
    await HelperService.writeJson(filePath, content)
  }

  // Create auth tests file
  protected async copyAuthTests() {
    const filePath = `${this.input.path}/test/auth.spec.ts`
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
   * 1. Install dependencies
   */
  protected async start() {
    await HelperService.execute(
      'npm',
      ['i', '-D', 'japa', 'execa', 'get-port', 'supertest', '@types/supertest'],
      { cwd: this.input.path }
    )
    await this.updatePackageJson()
    await this.copyTestEnv()
    await this.createJapaFile()
    await HelperService.execute('npm', ['run', 'format'], { cwd: this.input.path })
    await HelperService.commit('Test dependencies added', this.input.path)

    await Promise.all([await mkdirp(`${this.input.path}/test`)])
    await this.copyAuthTests()
    await HelperService.execute('npm', ['run', 'format'], { cwd: this.input.path })
    await HelperService.commit('First Test added', this.input.path)
  }

  public async init() {
    await this.start()
  }
}
