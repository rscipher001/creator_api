import Application from '@ioc:Adonis/Core/Application'
import { string } from '@ioc:Adonis/Core/Helpers'
import ProjectInput, { Table } from 'App/Interfaces/ProjectInput'
import HelperService from 'App/Services/HelperService'

import AdonisInit from 'App/Services/Backend/Adonis/Init'
import AdonisDatabaseGenerator from 'App/Services/Backend/Adonis/DatabaseGenerator'
import AdonisAuthGenerator from 'App/Services/Backend/Adonis/AuthGenerator'
import AdonisCRUDGenerator from 'App/Services/Backend/Adonis/CRUDGenerator'
import AdonisTestGenerator from 'App/Services/Backend/Adonis/TestGenerator'

import BuefyInit from 'App/Services//Frontend/Buefy/Init'
import BuefyAuthGenerator from 'App/Services/Frontend/Buefy/AuthGenerator'
import BuefyCRUDGenerator from 'App/Services/Frontend/Buefy/CRUDGenerator'

class BackendProjectService {
  private input: any
  private projectInput: ProjectInput

  constructor(input) {
    this.input = input
  }

  public prepareTable(table): Table {
    table.name = string.pascalCase(table.name)
    table.names = HelperService.generateNames(table.name)
    table.tableName = this.input.camelCaseStrategy
      ? table.names.camelCasePlural
      : table.names.snakeCasePlural
    table.operations = table.operations.map((operation) => operation.toLocaleLowerCase())
    table.columns = table.columns.map((column) => {
      column.name = string.pascalCase(column.name)
      column.names = HelperService.generateNames(column.name)
      column.columnName = this.input.camelCaseStrategy
        ? column.names.camelCase
        : column.names.snakeCase
      column.type = column.type.toLowerCase()
      return column
    })
    return table as Table
  }

  /**
   * Prepares input by cleaning and standardize it
   */
  public prepare(): ProjectInput {
    const projectInput: any = {}
    projectInput.camelCaseStrategy = !!this.input.camelCaseStrategy
    projectInput.generate = this.input.generate
    projectInput.names = HelperService.generateExtendedNames(this.input.name)
    projectInput.name = projectInput.names.pascalCase
    projectInput.projectsPath = Application.makePath('../projects')
    projectInput.path = `${projectInput.projectsPath}/${projectInput.names.dashCase}`
    projectInput.spaPath = `${projectInput.projectsPath}/${projectInput.names.dashCase}-spa`
    projectInput.basePath = projectInput.names.dashCase
    projectInput.database = this.input.database.toLocaleLowerCase()
    projectInput.types = this.input.types.map((t) => t.toLowerCase())
    projectInput.auth = this.input.auth
    projectInput.tech = this.input.tech
    projectInput.auth.table = this.prepareTable(this.input.auth.table)
    projectInput.tables = this.input.tables.map((table) => this.prepareTable(table))
    if (!this.input.git) {
      projectInput.git = {
        email: '22148496+RSCipher001@users.noreply.github.com',
        name: 'Ravindra Sisodia',
      }
    } else {
      projectInput.git = this.input.git
    }
    this.projectInput = projectInput as ProjectInput
    return this.projectInput
  }

  /**
   * Handle complete project creation
   */
  public async start() {
    try {
      // Generate Project
      if (this.projectInput.generate.api.generate) {
        const init = new AdonisInit(this.projectInput)
        await init.init() // Initialize project

        // Add database
        if (this.projectInput.generate.api.db) {
          const db = new AdonisDatabaseGenerator(this.projectInput)
          await db.init()
        }

        // Add Auth
        if (this.projectInput.generate.api.db && this.projectInput.generate.api.auth) {
          const auth = new AdonisAuthGenerator(this.projectInput)
          await auth.init()
        }

        // Add CRUD for models
        if (this.projectInput.generate.api.db && this.projectInput.generate.api.crud) {
          const crud = new AdonisCRUDGenerator(this.projectInput)
          await crud.init()
        }

        // Add Tests for everything
        if (this.projectInput.generate.api.auth && this.projectInput.generate.api.test) {
          const test = new AdonisTestGenerator(this.projectInput)
          await test.init()
        }
      }

      // Prepare frontend
      if (this.projectInput.generate.spa.generate) {
        const spa = new BuefyInit(this.projectInput)
        await spa.init()

        // Prepare frontend auth
        if (this.projectInput.generate.spa.auth) {
          const auth = new BuefyAuthGenerator(this.projectInput)
          await auth.init()
        }

        // Add CRUD for models
        if (this.projectInput.generate.spa.crud) {
          const crud = new BuefyCRUDGenerator(this.projectInput)
          await crud.init()
        }
      }
      console.log('Project Generated Successfully')
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  /**
   * Prepare input
   */
  public async init() {
    this.prepare() // Clean and preprocess input
    await this.start() // Start generation
  }
}
export default BackendProjectService
