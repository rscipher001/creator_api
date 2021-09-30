import os from 'os'
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
    const provider = '@adonisjs/mail'
    const command = '@adonisjs/mail/build/commands'
    if (!content.providers.includes(provider)) {
      content.providers.push(provider)
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
    const type = '@adonisjs/mail'
    if (!content.compilerOptions.types.includes(type)) {
      content.compilerOptions.types.push(type)
      await HelperService.writeJson(filePath, content)
    }
  }

  // Update ace-manifest.json
  protected async updateAceManifestJson() {
    const filePath = `${this.input.path}/ace-manifest.json`
    const content = await HelperService.readJson(filePath)

    // No need to do any check since all of these are assignment not push in array
    content.commands['make:mailer'] = {
      settings: {},
      commandPath: '@adonisjs/mail/build/commands/MakeMailer',
      commandName: 'make:mailer',
      description: 'Make a new mailer class',
      args: [
        {
          type: 'string',
          propertyName: 'name',
          name: 'name',
          required: true,
          description: 'Name of the mailer class',
        },
      ],
      aliases: [],
      flags: [],
    }

    await HelperService.writeJson(filePath, content)
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
  }

  /**
   * Steps
   * 1. Install mailer module
   * 2. Update common files
   * 3. Copy & update mailer module related files
   */
  protected async start() {
    // Install auth module
    const npmModules = ['install', '@adonisjs/mail']
    if (this.input.mailers.includes('ses')) {
      npmModules.push('aws-sdk')
    }
    await HelperService.execute('npm', npmModules, {
      cwd: this.input.path,
    })

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
    await HelperService.execute('npm', ['run', 'format'], { cwd: this.input.path })
    await HelperService.commit('Mailer added', this.input.path)
  }

  public async init() {
    await this.start()
  }
}
