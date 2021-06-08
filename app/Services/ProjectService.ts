import Application from '@ioc:Adonis/Core/Application'
import { string } from '@ioc:Adonis/Core/Helpers'
import ProjectInput, { Table } from 'App/Interfaces/ProjectInput'
import APIInit from 'App/Services/Backend/Init'
import DatabaseGenerator from 'App/Services/Backend/DatabaseGenerator'
import BackendAuthGenerator from 'App/Services/Backend/AuthGenerator'
import FrontendAuthGenerator from 'App/Services/Frontend/AuthGenerator'
import HelperService from 'App/Services/HelperService'
import BackendTestGenerator from './Backend/TestGenerator'
import BackendCRUDGenerator from './Backend/CRUDGenerator'
import FrontendCRUDGenerator from './Frontend/CRUDGenerator'
import SPAInit from './Frontend/Init'

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
    projectInput.skip = this.input.skip
    projectInput.names = HelperService.generateExtendedNames(this.input.name)
    projectInput.name = projectInput.names.pascalCase
    projectInput.projectsPath = Application.makePath('../projects')
    projectInput.path = `${projectInput.projectsPath}/${projectInput.names.dashCase}`
    projectInput.spaPath = `${projectInput.projectsPath}/${projectInput.names.dashCase}-spa`
    projectInput.basePath = projectInput.names.dashCase
    projectInput.database = this.input.database.toLocaleLowerCase()
    projectInput.types = this.input.types.map((t) => t.toLowerCase())
    projectInput.auth = this.input.auth
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
      if (!this.input.skip.init) {
        const init = new APIInit(this.projectInput)
        await init.init() // Initialize project
      }

      // Add database
      if (!this.input.skip.db) {
        const db = new DatabaseGenerator(this.projectInput)
        await db.init()
      }

      // Add Auth
      if (!this.input.skip.auth) {
        const auth = new BackendAuthGenerator(this.projectInput)
        await auth.init()
      }

      // Add CRUD for models
      if (!this.input.skip.crud) {
        const crud = new BackendCRUDGenerator(this.projectInput)
        await crud.init()
      }

      // Add Tests for everything
      if (!this.input.skip.test) {
        const test = new BackendTestGenerator(this.projectInput)
        await test.init()
      }

      // Prepare frontend
      if (!this.input.skip.spa) {
        const spa = new SPAInit(this.projectInput)
        await spa.init()
      }

      // Prepare frontend auth
      if (!this.input.skip.spaAuth) {
        const auth = new FrontendAuthGenerator(this.projectInput)
        await auth.init()
      }

      // Add CRUD for models
      if (!this.input.skip.spaCrud) {
        const crud = new FrontendCRUDGenerator(this.projectInput)
        await crud.init()
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
