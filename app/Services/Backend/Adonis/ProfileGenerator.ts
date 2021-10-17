import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'

export default class ProfileGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  // Generate profile validators
  protected async generateProfileValidators() {
    const basePath = `stubs/backend/${this.input.tech.backend}/full/app/Validators`
    // Generate ProfileValidator
    const profileValidatorViewPath = `${basePath}/profileValidatorTs`
    const profileValidatorPath = `${this.input.path}/app/Validators/ProfileValidator.ts`
    const profileValidatorFileExists = await HelperService.fileExists(profileValidatorPath)
    if (!profileValidatorFileExists) {
      const content = await View.render(profileValidatorViewPath)
      await HelperService.writeFile(profileValidatorPath, content)
    }

    // Generate AccountValidator
    const accountValidatorViewPath = `${basePath}/accountValidatorTs`
    const accountValidatorPath = `${this.input.path}/app/Validators/AccountValidator.ts`
    const accountValidatorFileExists = await HelperService.fileExists(accountValidatorPath)
    if (!accountValidatorFileExists) {
      const content = await View.render(accountValidatorViewPath)
      await HelperService.writeFile(accountValidatorPath, content)
    }
    // Generate SecurityValidator
    const changePasswordValidatorViewPath = `${basePath}/changePasswordValidatorTs`
    const changePasswordValidatorPath = `${this.input.path}/app/Validators/ChangePasswordValidator.ts`
    const changePasswordValidatorFileExists = await HelperService.fileExists(
      changePasswordValidatorPath
    )
    if (!changePasswordValidatorFileExists) {
      const content = await View.render(changePasswordValidatorViewPath)
      await HelperService.writeFile(changePasswordValidatorPath, content)
    }
  }

  // Copy email tempates
  protected async copyEmailTemplates() {
    const basePath = `stubs/backend/${this.input.tech.backend}/full/resources/views/emails`
    const passwordResetEmailViewPath = `${basePath}/passwordResetEdge`
    const passwordResetEmailPath = `${this.input.path}/resources/views/emails/passwordReset.edge`
    const passwordResetEmailExists = await HelperService.fileExists(passwordResetEmailPath)
    if (!passwordResetEmailExists) {
      const content = await View.render(passwordResetEmailViewPath)
      await HelperService.writeFile(passwordResetEmailPath, content)
    }

    const emailVerificationEmailViewPath = `${basePath}/emailVerificationEdge`
    const emailVerificationEmailPath = `${this.input.path}/resources/views/emails/emailVerification.edge`
    const emailVerificationEmailExists = await HelperService.fileExists(emailVerificationEmailPath)
    if (!emailVerificationEmailExists) {
      const content = await View.render(emailVerificationEmailViewPath)
      await HelperService.writeFile(emailVerificationEmailPath, content)
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

  // Create app/Controllers/Http/Api/EmailVerificationController.ts
  protected async createApiEmailVerificationController() {
    const table = this.input.auth.table
    const filePath = `${this.input.path}/app/Controllers/Http/API/EmailVerificationController.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const email = table.columns.find((c) => c.name === 'Email')
      const password = table.columns.find((c) => c.name === 'Password')
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Controllers/Http/API/emailVerificationControllerTs`,
        {
          email,
          password,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create app/Controllers/Http/Api/ProfileController.ts
  protected async createApiProfileController() {
    const filePath = `${this.input.path}/app/Controllers/Http/API/ProfileController.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Controllers/Http/API/profileControllerTs`
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Add start/routes.ts
  protected async addApiProfileRoutes() {
    const filePath = `${this.input.path}/start/routes.ts`
    let content = await HelperService.readFile(filePath)
    const part = await View.render(
      `stubs/backend/${this.input.tech.backend}/partials/profileGenerator/apiRoutesTs`,
      {
        input: this.input,
      }
    )
    content += part
    await HelperService.writeFile(filePath, content)
  }

  // Update start/kernel.ts
  protected async addMiddlewaresToKernel() {
    const filePath = `${this.input.path}/start/kernel.ts`
    let content = await HelperService.readFile(filePath)
    const searchFor = "auth: () => import('App/Middleware/Auth'),"
    const lineToAdd = "ensureEmailIsVerified: () => import('App/Middleware/EnsureEmailIsVerified'),"
    const replaceWith = `${searchFor} ${lineToAdd}`
    // If auth middlware is registered then add this middleware after that
    if (content.indexOf(searchFor) !== -1) {
      await HelperService.writeFile(filePath, content.replace(searchFor, replaceWith))
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

  // Create app/Middleware/EnsureEmailIsVerified.ts
  protected async createAppMiddlewareEnsureEmailIsVerifiedTs() {
    const filePath = `${this.input.path}/app/Middleware/EnsureEmailIsVerified.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Middleware/ensureEmailIsVerifiedTs`
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create app/Models/VerificationToken.ts
  protected async createModel() {
    const filePath = `${this.input.path}/app/Models/VerificationToken.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/app/Models/tokenModelTs`,
        {
          className: 'VerificationToken',
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  /**
   * Steps
   * 0. Copy VerificationModel
   * 1. Copy email verification controller
   * 2. Copy profile controller
   * 3. Copy and register email ensured middleware
   * 4. Copy email templates
   * 5. Register validators
   * 6. Register routes
   */
  protected async start() {
    // 0. Copy VerificationModel
    await this.createModel()

    // 1. Copy email verification controller
    await this.createApiEmailVerificationController()

    // 2. Copy profile controller
    await this.createApiProfileController()

    // 3. Copy and register email ensured middleware
    await this.createAppMiddlewareEnsureEmailIsVerifiedTs()
    await this.addMiddlewaresToKernel()

    // 4. Copy email templates
    await this.copyEmailTemplates()

    // 5. Generate validators
    await this.generateProfileValidators()

    // 6. Add profile route
    await this.addApiProfileRoutes()

    await HelperService.commit('Profile APIs added', this.input.path)
  }

  public async init() {
    await this.start()
  }
}
