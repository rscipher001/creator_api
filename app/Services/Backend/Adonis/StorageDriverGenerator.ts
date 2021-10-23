import os from 'os'
import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'

export default class StorageDriverGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  // Update .adonisrc.json
  protected async updateDotAdonisrcJson() {
    const path = `${this.input.path}/.adonisrc.json`
    const content = await HelperService.readJson(path)
    if (this.input.storageDrivers.includes('s3')) {
      const provider = '@adonisjs/drive-s3'
      if (!content.providers.includes(provider)) {
        content.providers.push(provider)
      }
    }
    if (this.input.storageDrivers.includes('gcs')) {
      const provider = '@adonisjs/drive-gcs'
      if (!content.providers.includes(provider)) {
        content.providers.push(provider)
      }
    }
    await HelperService.writeJson(path, content)
  }

  // Update tsconfig.json
  protected async updateTsconfigJson() {
    const path = `${this.input.path}/tsconfig.json`
    const content = await HelperService.readJson(path)
    if (this.input.storageDrivers.includes('s3')) {
      const type = '@adonisjs/drive-s3'
      content.compilerOptions.types.push(type)
    }
    if (this.input.storageDrivers.includes('gcs')) {
      const type = '@adonisjs/drive-gcs'
      content.compilerOptions.types.push(type)
    }
    await HelperService.writeJson(path, content)
  }

  // Create contracts/drive.ts
  protected async createContractsDriveTs() {
    const path = `${this.input.path}/contracts/drive.ts`
    const content = await View.render(
      `stubs/backend/${this.input.tech.backend}/full/contracts/driveTs`,
      {
        storageDrivers: this.input.storageDrivers,
      }
    )
    await HelperService.writeFile(path, content)
  }

  // Create config/drive.ts
  protected async createConfigDriveTs() {
    const path = `${this.input.path}/config/drive.ts`
    const content = await View.render(
      `stubs/backend/${this.input.tech.backend}/full/config/driveTs`,
      {
        defaultStorageDriver: this.input.defaultStorageDriver,
        storageDrivers: this.input.storageDrivers,
      }
    )
    await HelperService.writeFile(path, content)
  }

  // Update .env & .env.example
  protected async updateDotEnv(path = '.env') {
    const storageDrivers = this.input.storageDrivers
    const filePath = `${this.input.path}/${path}`
    let content = await HelperService.readFile(filePath)

    // The following code can be improved
    const part = await View.render(
      `stubs/backend/${this.input.tech.backend}/partials/storageDriverGenerator/dotEnv`,
      { storageDrivers }
    )
    content += part
    await HelperService.writeFile(filePath, content)
  }

  // Update env.ts
  protected async updateEnvTs() {
    const storageDrivers = this.input.storageDrivers
    const filePath = `${this.input.path}/env.ts`
    let content = await HelperService.readFile(filePath)
    const part = await View.render(
      `stubs/backend/${this.input.tech.backend}/partials/storageDriverGenerator/envTs`,
      { storageDrivers }
    )
    const envTsLines = content.split(os.EOL)

    // If last line ie empty and second last line is closing Env.rules with })
    if (envTsLines.slice(-1)[0] === '' && envTsLines.slice(-2)[0] === '})') {
      const envTsStorageDriverContentLines = part.split(os.EOL)
      envTsStorageDriverContentLines.forEach((newLine) => {
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
    await this.createContractsDriveTs()

    // Create config/mail.ts
    await this.createConfigDriveTs()
  }

  /**
   * Steps
   * 1. Install storage drivers if required
   * 2. Configure storage module
   * 3. Update env files
   */
  protected async start() {
    // Install dependencies
    const npmArguments = ['install', '@adonisjs/attachment-lite']
    if (this.input.storageDrivers.includes('s3')) {
      npmArguments.push('@adonisjs/drive-s3')
    }
    if (this.input.storageDrivers.includes('gcs')) {
      npmArguments.push('@adonisjs/drive-gcs')
    }
    await HelperService.execute('npm', npmArguments, {
      cwd: this.input.path,
    })

    // Update common files related to database
    // 1. .adonisrc.json
    // 2. tsconfig.json
    // 3. ace-manifest.json
    await this.updateDotAdonisrcJson()
    await this.updateTsconfigJson()
    await this.updateDotEnv('.env')
    await this.updateDotEnv('.env.example')
    await this.updateEnvTs()

    // Copy config, contracts, etc
    await this.initModuleFiles()
    await HelperService.commit('Storage drivers added', this.input.path)
  }

  public async init() {
    await this.start()
  }
}
