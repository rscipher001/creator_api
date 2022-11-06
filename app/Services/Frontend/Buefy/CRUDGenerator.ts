import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput, { Table } from 'App/Interfaces/ProjectInput'

export default class CRUDGenerator {
  private input: ProjectInput
  private models: string[] // Used for state registration in store/index.js

  constructor(input: ProjectInput) {
    this.input = input
    this.models = []
  }

  /**
   * Create view for creating and updating resource
   */
  protected async createCreateView(table: Table) {
    const filePath = `${this.input.spaPath}/src/views/${table.names.pascalCase}Create.vue`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/frontend/${this.input.tech.frontend}/full/src/views/modelCreateVue`,
        {
          input: this.input,
          table,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  /**
   * Create view for listing resource
   */
  protected async createListView(table: Table) {
    const filePath = `${this.input.spaPath}/src/views/${table.names.pascalCase}List.vue`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/frontend/${this.input.tech.frontend}/full/src/views/modelListVue`,
        {
          input: this.input,
          table,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  /**
   * Create view for importing CSV page
   */
  protected async createStoreManyView(table: Table) {
    const filePath = `${this.input.spaPath}/src/views/${table.names.pascalCase}ImportCSV.vue`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/frontend/${this.input.tech.frontend}/full/src/views/modelImportCSVVue`,
        {
          input: this.input,
          table,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  /**
   * Create state for resource
   */
  protected async createState(table: Table) {
    const filePath = `${this.input.spaPath}/src/store/modules/${table.names.camelCase}.state.js`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/frontend/${this.input.tech.frontend}/full/src/store/modules/modelStateJs`,
        {
          input: this.input,
          table,
        }
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  /**
   * Import state for resource
   */
  protected async importState(table: Table) {
    const storePath = `${this.input.spaPath}/src/store/index.js`
    let storeContent = await HelperService.readFile(storePath)

    // If import auth statement is not in file then it is not registered
    if (storeContent.indexOf(`import ${table.names.camelCase}`) === -1) {
      const importVuexLine = 'import Vuex from "vuex";'
      const importResourceStateLine = `import ${table.names.camelCase} from "./modules/${table.names.camelCase}.state";\n`
      const index = storeContent.indexOf(importVuexLine) + importVuexLine.length + 1
      storeContent = await HelperService.insertLines(storeContent, index, importResourceStateLine)
      await HelperService.writeFile(storePath, storeContent)
    }
  }

  /**
   * Add routes for resouce in router/index.js
   */
  protected async registerRoutes() {
    const filePath = `${this.input.spaPath}/src/router/index.js`
    const content = await View.render(
      `stubs/frontend/${this.input.tech.frontend}/full/src/router/indexJs`,
      {
        input: this.input,
      }
    )
    await HelperService.writeFile(filePath, content)
  }

  /**
   * Add all modules in modules object
   */
  protected async registerStates() {
    const filePath = `${this.input.spaPath}/src/store/index.js`
    let content = await HelperService.readFile(filePath)
    const contentToInsert = `, ` + this.models.join(', ')
    const modulesLine = 'modules: { auth },'

    // Get position of auth so we can put states liek 'auth, ...'
    const index = content.indexOf(modulesLine) + modulesLine.length - 3
    content = await HelperService.insertLines(content, index, contentToInsert)
    await HelperService.writeFile(filePath, content)
  }

  /**
   * Adds routes in navbar for all models
   */
  protected async addRoutes() {
    const filePath = `${this.input.spaPath}/src/components/NavBar.vue`
    const content = await View.render(
      `stubs/frontend/${this.input.tech.frontend}/full/src/components/navBarVue`,
      {
        input: this.input,
        auth: false, // Generate all routes, not nav only
      }
    )
    await HelperService.writeFile(filePath, content)
  }

  /**
   * Steps
   */
  protected async start() {
    // Auth table
    await this.createCreateView(this.input.auth.table)
    await this.createListView(this.input.auth.table)
    await this.createStoreManyView(this.input.auth.table)
    await HelperService.execute('npm', ['run', 'lint'], { cwd: this.input.spaPath })
    await HelperService.commit(
      `CRUD Added for ${this.input.auth.table.names.pascalCase}`,
      this.input.spaPath
    )
    this.models.push(this.input.auth.table.names.camelCase)

    // All non auth tables
    for (let i = 0; i < this.input.tables.length; i += 1) {
      if (!this.input.tables[i].generateUI) continue
      const table = this.input.tables[i]
      await this.createCreateView(table)
      await this.createListView(table)
      await this.createStoreManyView(table)
      await HelperService.execute('npm', ['run', 'lint'], { cwd: this.input.spaPath })
      await HelperService.commit(
        `CRUD Added for ${this.input.tables[i].names.pascalCase}`,
        this.input.spaPath
      )
      this.models.push(this.input.tables[i].names.camelCase)
    }
    await this.registerRoutes()

    // Run loop for states separately to avoid unused import warning which results in commit failure
    // Auth table
    if (this.input.auth.table.generateUI) {
      await this.createState(this.input.auth.table)
      await this.importState(this.input.auth.table)
    }

    // Non auth table
    for (let i = 0; i < this.input.tables.length; i += 1) {
      const table = this.input.tables[i]
      if (!table.generateUI) continue
      await this.createState(table)
      await this.importState(table)
    }
    await this.registerStates()
    await this.addRoutes()
    await HelperService.execute('npm', ['run', 'lint'], { cwd: this.input.spaPath })
    await HelperService.commit('States Added for all resources', this.input.spaPath)
  }

  public async init() {
    await this.start()
  }
}
