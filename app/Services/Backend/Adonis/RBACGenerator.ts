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
          items: this.input.rbac.permissions.map((r) => ({ name: r })),
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  /**
   * Steps
   * 1. Add seeder data
   */
  protected async start() {
    const rbac = this.input.rbac
    if (!rbac.enabled) return

    await this.createSeeders()
  }

  public async init() {
    await this.start()
  }
}
