import mkdirp from 'mkdirp'
import View from '@ioc:Adonis/Core/View'
import Logger from '@ioc:Adonis/Core/Logger'
import { ProjectType } from 'App/Interfaces/Enums'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'

export default class AuthGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  // Copy cors config
  protected async updateConfigCorsTs() {
    const filePath = `${this.input.path}/config/cors.ts`

    const content = await View.render(
      `stubs/backend/${this.input.tech.backend}/full/config/corsTs`,
      {
        types: this.input.types,
      }
    )
    await HelperService.writeFile(filePath, content)
  }

  // Update .adonisrc.json
  protected async updateDotAdonisrcJson() {
    const filePath = `${this.input.path}/.adonisrc.json`
    const content = await HelperService.readJson(filePath)
    const provider = '@adonisjs/auth'
    if (!content.providers.includes(provider)) {
      content.providers.push(provider)
      await HelperService.writeJson(filePath, content)
    }
  }

  // Update tsconfig.json
  protected async updateTsconfigJson() {
    const filePath = `${this.input.path}/tsconfig.json`
    const content = await HelperService.readJson(filePath)
    const type = '@adonisjs/auth'
    if (!content.compilerOptions.types.includes(type)) {
      content.compilerOptions.types.push(type)
      await HelperService.writeJson(filePath, content)
    }
  }

  // Create contracts/auth.ts
  protected async createContractsAuthTs() {
    const filePath = `${this.input.path}/contracts/auth.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/contracts/authTs`,
        {
          types: this.input.types,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create config/auth.ts
  protected async createConfigAuthTs() {
    const filePath = `${this.input.path}/config/auth.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/config/authTs`,
        {
          types: this.input.types,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create config/auth.ts
  protected async createApiTokenMigration() {
    const namePart = 'api_tokens.ts'
    const migrationsPath = `${this.input.path}/database/migrations`
    const migrationFileNames = await HelperService.readdir(migrationsPath)
    let fileExists = false
    if (migrationFileNames.length) {
      fileExists = !!migrationFileNames.find((fileName) => fileName.indexOf(namePart) !== -1)
    }
    if (!fileExists) {
      await HelperService.sleep(1000) // Ensure unique timestamp in user and token files
      const timestamp = new Date().getTime()
      const filePath = `${this.input.path}/database/migrations/${timestamp}_${namePart}`
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/database/migrations/apiTokensTs.edge`,
        {
          types: this.input.types,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create app/Models/{Auth}.ts
  protected async createAuthModel() {
    const table = this.input.auth.table
    const filePath = `${this.input.path}/app/Models/${table.names.pascalCase}.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Models/modelTs`,
        {
          isAuth: true,
          input: this.input,
          table,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create database/migrations/{Auth}.ts
  protected async createAuthMigration() {
    const table = this.input.auth.table
    const namePart = `${table.names.snakeCasePlural}.ts`
    const migrationsPath = `${this.input.path}/database/migrations`
    const migrationFileNames = await HelperService.readdir(migrationsPath)
    let fileExists = false
    if (migrationFileNames.length) {
      fileExists = !!migrationFileNames.find((fileName) => fileName.indexOf(namePart) !== -1)
    }
    if (!fileExists) {
      await HelperService.sleep(1000) // Ensure migrations get unique timestamps
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/database/migrations/migrationTs`,
        {
          isAuth: true,
          input: this.input,
          table,
        }
      )
      const timestamp = new Date().getTime()
      const filePath = `${this.input.path}/database/migrations/${timestamp}_${namePart}`
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create app/Controllers/Http/Api/AuthController.ts
  protected async createApiAuthController() {
    const table = this.input.auth.table
    const filePath = `${this.input.path}/app/Controllers/Http/API/AuthController.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const email = table.columns.find((c) => c.name === 'Email')
      const password = table.columns.find((c) => c.name === 'Password')
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Controllers/Http/API/authControllerTs`,
        {
          input: this.input,
          table,
          email,
          password,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Add start/routes.ts
  protected async addApiAuthRoutes() {
    const filePath = `${this.input.path}/start/routes.ts`
    let content = await HelperService.readFile(filePath)
    if (content.indexOf('API/AuthController') === -1) {
      const part = await View.render(
        `stubs/backend/${this.input.tech.backend}/partials/authGenerator/apiRoutesTs`,
        {
          input: this.input,
        }
      )
      content += part
      await HelperService.writeFile(filePath, content)
    }
  }

  // Update start/kernel.ts
  protected async addMiddlewaresToKernel() {
    const filePath = `${this.input.path}/start/kernel.ts`
    let content = await HelperService.readFile(filePath)
    const searchFor = 'Server.middleware.registerNamed({})'

    // If no named middlewares are registered then register auth middleware
    if (content.indexOf(searchFor) !== -1) {
      const part = await View.render(
        `stubs/backend/${this.input.tech.backend}/partials/authGenerator/kernelTs`
      )
      content = content.replace(searchFor, part)
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create app/Validators/RegisterValidator.ts
  protected async createAppValidatorsRegisterValidatorTs() {
    const filePath = `${this.input.path}/app/Validators/RegisterValidator.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const email = this.input.auth.table.columns.find((c) => c.name === 'Email')
      const password = this.input.auth.table.columns.find((c) => c.name === 'Password')
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Validators/registerValidatorTs`,
        {
          input: this.input,
          table: this.input.auth.table,
          email,
          password,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create app/Validators/LoginValidator.ts
  protected async createAppValidatorsLoginValidatorTs() {
    const filePath = `${this.input.path}/app/Validators/LoginValidator.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const email = this.input.auth.table.columns.find((c) => c.name === 'Email')
      const password = this.input.auth.table.columns.find((c) => c.name === 'Password')
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Validators/loginValidatorTs`,
        {
          input: this.input,
          table: this.input.auth.table,
          email,
          password,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create app/Middleware/SilentAuth.ts
  protected async createAppMiddlewareSilentAuthTs() {
    const filePath = `${this.input.path}/app/Middleware/SilentAuth.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Middleware/silentAuthTs`,
        {
          types: this.input.types,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create app/Middleware/Auth.ts
  protected async createAppMiddlewareAuthTs() {
    const filePath = `${this.input.path}/app/Middleware/Auth.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Middleware/authTs`,
        {
          types: this.input.types,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  /**
   * Copy module files
   * 1. app/Middleware/Auth.ts
   * 3. contracts/auth.ts
   * 4. config/auth.ts // Dynamic
   * 5. app/Models/User.ts // Dynamic
   * 6. database/migrations/users.ts // Dynamic
   * 7. database/migrations/api_tokens.ts // Dynamic
   * 8. app/Controller/Http/API/AuthController.ts // Dynamic
   * 9. start/routes.ts
   * 10. start/kernel.ts
   */
  protected async initModuleFiles() {
    // Create app/Middleware/Auth.ts
    await this.createAppMiddlewareAuthTs()

    // Create app/Middleware/SilentAuth.ts
    await this.createAppMiddlewareSilentAuthTs()

    // Create Validators
    await this.createAppValidatorsLoginValidatorTs()
    if (this.input.auth.register) {
      await this.createAppValidatorsRegisterValidatorTs()
    }

    // Create contracts/auth.ts
    await this.createContractsAuthTs()

    // Update start/kernel.ts
    await this.addMiddlewaresToKernel()

    // Create config/auth.ts
    await this.createConfigAuthTs()

    // Update config/cors.ts
    await this.updateConfigCorsTs()

    // Create app/Models/{Auth}.ts
    await this.createAuthModel()

    // Create database/migrations/{Auth}.ts
    await this.createAuthMigration()

    // Create database/migrations/api_tokens.ts
    if (this.input.types.includes(ProjectType.API)) {
      await this.createApiTokenMigration()
      await this.createApiAuthController()
      await this.addApiAuthRoutes()
    }
  }

  /**
   * Steps
   * 2. Update common files
   * 3. Copy & update auth module related files
   * 3. Update migration, model, controller and routes
   */
  protected async start() {
    // Update common files related to database
    // 1. .adonisrc.json
    // 2. tsconfig.json
    await this.updateDotAdonisrcJson()
    await this.updateTsconfigJson()

    await Promise.all([
      await mkdirp(`${this.input.path}/app/Models`),
      await mkdirp(`${this.input.path}/app/Middleware`),
      await mkdirp(`${this.input.path}/database/migrations`),
      await mkdirp(`${this.input.path}/app/Controllers/Http/API/`),
      await mkdirp(`${this.input.path}/app/Validators`),
    ])

    // Copy migration, model, controller and routes
    await this.initModuleFiles()
    await HelperService.commit('Auth added', this.input.path)
    try {
      await HelperService.execute('npm', ['install', 'phc-argon2'], {
        cwd: this.input.path,
      })
      await HelperService.commit('Argon Added', this.input.path)
    } catch (e) {
      Logger.fatal('Argon installation failed:', e)
    }
  }

  public async init() {
    await this.start()
  }
}
