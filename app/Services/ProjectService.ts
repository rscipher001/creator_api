import mkdirp from 'mkdirp'
import Env from '@ioc:Adonis/Core/Env'
import ProjectInput from 'App/Interfaces/ProjectInput'
import SystemService from 'App/Services/SystemService'

import AdonisInit from 'App/Services/Backend/Adonis/Init'
import AdonisAuthGenerator from 'App/Services/Backend/Adonis/AuthGenerator'
import AdonisCRUDGenerator from 'App/Services/Backend/Adonis/CRUDGenerator'
import AdonisRBACGenerator from 'App/Services/Backend/Adonis/RBACGenerator'
import AdonisTestGenerator from 'App/Services/Backend/Adonis/TestGenerator'
import AdonisMailerGenerator from 'App/Services/Backend/Adonis/MailerGenerator'
import AdonisTenantGenerator from 'App/Services/Backend/Adonis/TenantGenerator'
import AdonisProfileGenerator from 'App/Services/Backend/Adonis/ProfileGenerator'
import AdonisDatabaseGenerator from 'App/Services/Backend/Adonis/DatabaseGenerator'
import AdonisPasswordResetGenerator from 'App/Services/Backend/Adonis/PasswordResetGenerator'
import AdonisStorageDriverGenerator from 'App/Services/Backend/Adonis/StorageDriverGenerator'

import BuefyInit from 'App/Services//Frontend/Buefy/Init'
import BuefyAuthGenerator from 'App/Services/Frontend/Buefy/AuthGenerator'
import BuefyCRUDGenerator from 'App/Services/Frontend/Buefy/CRUDGenerator'

import FlutterInit from 'App/Services//App/Flutter/Init'

// import HostingService from 'App/Services/HostingService'

class BackendProjectService {
  public projectInput: ProjectInput

  constructor(projectInput: ProjectInput) {
    this.projectInput = projectInput
  }

  /**
   * Handle complete project creation
   */
  public async start() {
    try {
      await mkdirp(this.projectInput.projectsPath)
      if (this.projectInput.generate.spa.generate) {
        const status = await SystemService.systemStatus()
        if (!status['vue']) {
          throw new Error('Vue CLI is not installed on this server yet')
        }
      }
      // Generate Project
      if (this.projectInput.generate.api.generate) {
        const init = new AdonisInit(this.projectInput)
        await init.init() // Initialize project

        // Add database
        const db = new AdonisDatabaseGenerator(this.projectInput)
        await db.init()

        // Add storage driver
        if (this.projectInput.storageEnabled) {
          const storageDriver = new AdonisStorageDriverGenerator(this.projectInput)
          await storageDriver.init()
        }

        // Add mailer
        if (this.projectInput.mailEnabled) {
          const mailer = new AdonisMailerGenerator(this.projectInput)
          await mailer.init()
        }

        // Add Auth
        const auth = new AdonisAuthGenerator(this.projectInput)
        await auth.init()

        // Add RBAC
        const rbac = new AdonisRBACGenerator(this.projectInput)
        await rbac.init()

        if (
          this.projectInput.mailEnabled &&
          this.projectInput.mailers.length &&
          (this.projectInput.auth.passwordChange || this.projectInput.auth.passwordReset)
        ) {
          // Add Password reset
          const passwordReset = new AdonisPasswordResetGenerator(this.projectInput)
          await passwordReset.init()
        }

        // Add Profile
        const profile = new AdonisProfileGenerator(this.projectInput)
        await profile.init()

        // Add Tenant
        if (this.projectInput.tenantSettings.tenant !== 0) {
          const tenant = new AdonisTenantGenerator(this.projectInput)
          await tenant.init()
        }

        // Add CRUD for models
        if (this.projectInput.generate.api.crud) {
          const crud = new AdonisCRUDGenerator(this.projectInput)
          await crud.init()
        }

        // Add Tests for everything
        if (this.projectInput.generate.api.test) {
          const test = new AdonisTestGenerator(this.projectInput)
          await test.init()
        }

        // Add build step in pre commit hooks
        // Removed during generation to avoid slow down and
        // Non fatal build failures
        await init.ehancePreCommitHook()
      }

      // Prepare frontend
      if (this.projectInput.generate.spa.generate) {
        const spa = new BuefyInit(this.projectInput)
        await spa.init()

        // Prepare frontend auth
        const auth = new BuefyAuthGenerator(this.projectInput)
        await auth.init()

        // Add CRUD for models
        if (this.projectInput.generate.spa.crud) {
          const crud = new BuefyCRUDGenerator(this.projectInput)
          await crud.init()
        }
      }

      if (this.projectInput.generate.app.generate) {
        const app = new FlutterInit(this.projectInput)
        await app.init()
      }

      if (Env.get('ENABLE_HOSTING')) {
        // const hostingService = new HostingService(this.projectInput)
        // await hostingService.init()
      }
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  /**
   * Prepare input
   */
  public async init() {
    await this.start() // Start generation
  }
}
export default BackendProjectService
