import os from 'os'
import mkdirp from 'mkdirp'
import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'

export default class MailerGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  // Update .adonisrc.json
  protected async updateDotAdonisrcJson() {
    const filePath = `${this.input.path}/.adonisrc.json`
    const content = await HelperService.readJson(filePath)
    const mailProvider = '@adonisjs/mail'
    const viewProvider = '@adonisjs/view'
    const command = '@adonisjs/mail/build/commands'
    content.metaFiles = [
      {
        pattern: 'resources/views/**/*.edge',
        reloadServer: false,
      },
    ]
    if (!content.providers.includes(mailProvider)) {
      content.providers.push(mailProvider)
    }
    if (!content.providers.includes(viewProvider)) {
      content.providers.push(viewProvider)
    }
    if (!content.commands.includes(command)) {
      content.commands.push(command)
    }
    await HelperService.writeJson(filePath, content)
  }

  // Update tsconfig.json
  protected async updateTsconfigJson() {
    const filePath = `${this.input.path}/tsconfig.json`
    const content = await HelperService.readJson(filePath)
    const mailType = '@adonisjs/mail'
    const viewType = '@adonisjs/view'
    if (!content.compilerOptions.types.includes(mailType)) {
      content.compilerOptions.types.push(mailType)
    }
    if (!content.compilerOptions.types.includes(viewType)) {
      content.compilerOptions.types.push(viewType)
    }
    await HelperService.writeJson(filePath, content)
  }

  // Update ace-manifest.json
  protected async updateAceManifestJson() {
    await HelperService.execute('node', ['ace', 'generate:manifest'], {
      cwd: this.input.path,
    })
  }

  // Create contracts/mail.ts
  protected async createContractsMailTs() {
    const filePath = `${this.input.path}/contracts/mail.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/contracts/mailTs`,
        {
          types: this.input.types,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create config/mail.ts
  protected async createConfigMailTs() {
    const filePath = `${this.input.path}/config/mail.ts`
    const fileExists = await HelperService.fileExists(filePath)
    const defaultMailer = this.input.defaultMailer
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/config/mailTs`,
        {
          defaultMailer,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Update .env & .env.example
  protected async updateDotEnv(path = '.env') {
    const mailers = this.input.mailers
    const filePath = `${this.input.path}/${path}`
    let content = await HelperService.readFile(filePath)

    // The following code can be improved
    const part = await View.render(
      `stubs/backend/${this.input.tech.backend}/partials/mailerGenerator/dotEnv`,
      { mailers }
    )
    content += part
    await HelperService.writeFile(filePath, content)
  }

  // Update env.ts
  protected async updateEnvTs() {
    const mailers = this.input.mailers
    const filePath = `${this.input.path}/env.ts`
    let content = await HelperService.readFile(filePath)
    const part = await View.render(
      `stubs/backend/${this.input.tech.backend}/partials/mailerGenerator/envTs`,
      { mailers }
    )
    const envTsLines = content.split(os.EOL)

    // If last line ie empty and second last line is closing Env.rules with })
    if (envTsLines.slice(-1)[0] === '' && envTsLines.slice(-2)[0] === '})') {
      const envTsMailerContentLines = part.split(os.EOL)
      envTsMailerContentLines.forEach((newLine) => {
        envTsLines.splice(envTsLines.length - 2, 0, newLine)
      })
      await HelperService.writeFile(filePath, envTsLines.join('\n'))
    }
  }

  // Copy emails
  protected async generateMailViews() {
    const filePath = `${this.input.path}/resources/views/emails/passwordReset.edge`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/resources/views/emails/passwordResetEdge`
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  /**
   * Copy module files
   * 1. contracts/mail.ts
   * 2. config/mail.ts
   */
  protected async initModuleFiles() {
    // Create contracts/mail.ts
    await this.createContractsMailTs()

    // Create config/mail.ts
    await this.createConfigMailTs()
    await this.generateMailViews()
  }

  /**
   * Steps
   * 2. Update common files
   * 3. Copy & update mailer module related files
   */
  protected async start() {
    await mkdirp(`${this.input.path}/resources/views/emails`)

    // Update common files related to database
    // 1. .adonisrc.json
    // 2. tsconfig.json
    // 3. ace-manifest.json
    await this.updateDotAdonisrcJson()
    await this.updateTsconfigJson()
    await this.updateAceManifestJson()
    await this.updateDotEnv('.env')
    await this.updateDotEnv('.env.example')
    await this.updateEnvTs()

    // Copy config, contracts, etc
    await this.initModuleFiles()
    await HelperService.commit('Mailer added', this.input.path)
  }

  public async init() {
    await this.start()
  }
}
