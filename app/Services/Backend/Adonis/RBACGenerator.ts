import mkdirp from 'mkdirp'
import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'

export default class RBACGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  protected async createSeeders() {
    await mkdirp(`${this.input.path}/database/seeders`)
    await this.createRoleSeeder()
    await this.createPermissionSeeder()
    await this.matrixSeeder()
  }

  protected async createRoleSeeder() {
    const filePath = `${this.input.path}/database/seeders/Role.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/database/seeders/modelTs`,
        {
          input: this.input,
          table: this.input.tables.find((t) => t.name === 'Role'),
          items: this.input.rbac.roles,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  protected async createPermissionSeeder() {
    const filePath = `${this.input.path}/database/seeders/Permission.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/database/seeders/modelTs`,
        {
          input: this.input,
          table: this.input.tables.find((t) => t.name === 'Permission'),
          items: this.input.rbac.permissions,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  protected async matrixSeeder() {
    const filePath = `${this.input.path}/database/seeders/PermissionRole.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/database/seeders/permissionRoleTs`,
        {
          input: this.input,
          matrix: this.input.rbac.matrix,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Update .adonisrc.json
  protected async updateDotAdonisrcJson() {
    const filePath = `${this.input.path}/.adonisrc.json`
    const content = await HelperService.readJson(filePath)
    const provider = '@adonisjs/bouncer'
    const command = '@adonisjs/bouncer/build/commands'
    const preload = './start/bouncer'
    if (!content.providers.includes(provider)) {
      content.providers.push(provider)
    }
    if (!content.commands.includes(command)) {
      content.commands.push(command)
    }
    if (!content.preloads.includes(preload)) {
      content.preloads.push(preload)
    }
    await HelperService.writeJson(filePath, content)
  }

  // Update tsconfig.json
  protected async updateTsconfigJson() {
    const filePath = `${this.input.path}/tsconfig.json`
    const content = await HelperService.readJson(filePath)
    const type = '@adonisjs/bouncer'
    if (!content.compilerOptions.types.includes(type)) {
      content.compilerOptions.types.push(type)
    }
    await HelperService.writeJson(filePath, content)
  }

  // Create start/bouncer.ts
  protected async createStartBouncerTs() {
    const filePath = `${this.input.path}/start/bouncer.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/start/bouncerTs`,
        {
          input: this.input,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create contracts/bouncer.ts
  protected async createContractsBouncerTs() {
    const filePath = `${this.input.path}/contracts/bouncer.ts`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/contracts/bouncerTs`,
        {
          types: this.input.types,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Update ace-manifest.json
  protected async updateAceManifestJson() {
    await HelperService.execute('node', ['ace', 'generate:manifest'], {
      cwd: this.input.path,
    })
  }

  /**
   * Steps
   * 1. Add seeder data
   */
  protected async start() {
    const rbac = this.input.rbac
    if (!rbac.enabled) return

    // Update common files related to bouncer
    // 1. .adonisrc.json
    // 2. tsconfig.json
    // 3. ace-manifest.json
    // 4. contracts/bouncer.ts
    // 5. ./start/bouncer.ts
    await this.updateDotAdonisrcJson()
    await this.updateTsconfigJson()
    await this.updateAceManifestJson()
    await this.createContractsBouncerTs()
    await this.createStartBouncerTs()

    await this.createSeeders()
  }

  public async init() {
    await this.start()
  }
}
