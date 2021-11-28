import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'

export default class CRUDGenerator {
  private input: ProjectInput
  private models: string[]

  constructor(input: ProjectInput) {
    this.input = input
    this.models = []
  }

  /**
   * Create view for creating and updating resource
   */
  protected async createCreateView(i: number) {
    const table = this.input.tables[i]
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
  protected async createListView(i: number) {
    const table = this.input.tables[i]
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
  protected async createStoreManyView(i: number) {
    const table = this.input.tables[i]
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
  protected async createState(i: number) {
    const table = this.input.tables[i]
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
  protected async importState(i: number) {
    const table = this.input.tables[i]
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
  protected async registerRoutes(i: number) {
    const table = this.input.tables[i]
    const part = await View.render(
      `stubs/frontend/${this.input.tech.frontend}/partial/crudGenerator/routerJs`,
      {
        input: this.input,
        table,
      }
    )

    const filePath = `${this.input.spaPath}/src/router/index.js`
    let content = await HelperService.readFile(filePath)
    const index = content.indexOf('];') - 1
    content = HelperService.insertLines(content, index, part)
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
    for (let i = 0; i < this.input.tables.length; i += 1) {
      if (!this.input.tables[i].generateUI) continue
      await this.createCreateView(i)
      await this.createListView(i)
      await this.createStoreManyView(i)
      // await this.createCreateModal(i)
      await this.registerRoutes(i)
      await HelperService.execute('npm', ['run', 'lint'], { cwd: this.input.spaPath })
      await HelperService.commit(
        `CRUD Added for ${this.input.tables[i].names.pascalCase}`,
        this.input.spaPath
      )
      this.models.push(this.input.tables[i].names.camelCase)
    }

    // Run loop for states separately to avoid unused import warning which results in commit failure
    for (let i = 0; i < this.input.tables.length; i += 1) {
      if (!this.input.tables[i].generateUI) continue
      await this.createState(i)
      await this.importState(i)
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
