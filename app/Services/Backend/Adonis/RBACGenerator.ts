import ProjectInput from 'App/Interfaces/ProjectInput'

export default class RBACGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  /**
   * Steps
   * 1. Add RBAC relations to user table
   * 2. Create RBAC migrations/enums
   * 2. Update common files
   * 3. Copy & update auth module related files
   * 3. Update migration, model, controller and routes
   */
  protected async start() {
    const rbac = this.input.rbac
    if (!rbac.enabled) return

    if (rbac.multipleRoles) {
      // Create relation with role and user
    } else {
      // User has one role => column for role needed
    }

    if (rbac.canAdminCreateRoles) {
      // Need a database because more roles will be added later
    } else {
      // Roles can be stored in either a file or database
    }

    if (Array.isArray(rbac.roles) && rbac.roles.length) {
      // Seed these roles
    }

    if (Array.isArray(rbac.roles) && rbac.roles.length) {
      // Seed these permissions
    }

    // Handle role & permission matrix
  }

  public async init() {
    await this.start()
  }
}
