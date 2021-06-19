import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'
import mkdirp from 'mkdirp'

export default class SPAGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  /**
   * 1. Add httpService
   * 2. Add validation exception
   * 3. Add middlewares
   */
  public async addCommonFiles() {
    await Promise.all([
      mkdirp(`${this.input.spaPath}/src/exceptions`),
      mkdirp(`${this.input.spaPath}/src/services`),
      mkdirp(`${this.input.spaPath}/src/router/middlewares`),
    ])

    await this.createSrcServicesHttpServiceJs()
    await this.createSrcExceptionsValidationExceptionJs()
    await this.createSrcRouterMiddlewaresAuthMiddlewareJs()
    await this.createSrcRouterMiddlewaresGuestMiddlewareJs()
  }

  public async installBuefy() {
    await HelperService.execute('npm', ['install', 'buefy', 'axios'], {
      cwd: this.input.spaPath,
    })
  }

  public async configureBuefy() {
    // Add buefy to main.js
    const importBuefy = 'import Buefy from "buefy";\n'
    const importBuefyCss = 'import "buefy/dist/buefy.css";\n'
    const useBuefy = 'Vue.use(Buefy);\n'
    const mainPath = `${this.input.spaPath}/src/main.js`
    let content = await HelperService.readFile(mainPath)

    // Add import buefy line
    if (content.indexOf(importBuefy) === -1) {
      const importVue = 'import Vue from "vue";'
      // Get where import statement ends
      // Index of import vue statement (starting poing) + its's length and new line(+1)
      const index = content.indexOf(importVue) + importVue.length + 1
      content = await HelperService.insertLines(content, index, importBuefy)
      await HelperService.writeFile(mainPath, content)
    }

    // Add import buefy.css line
    if (content.indexOf(importBuefyCss) === -1) {
      const importStore = 'import store from "./store";'
      const index = content.indexOf(importStore) + importStore.length + 1
      content = await HelperService.insertLines(content, index, importBuefyCss)
      await HelperService.writeFile(mainPath, content)
    }

    // Add use buefy line
    if (content.indexOf(useBuefy) === -1) {
      const index = content.indexOf(importBuefyCss) + importBuefyCss.length
      content = await HelperService.insertLines(content, index, '\n' + useBuefy)
      await HelperService.writeFile(mainPath, content)
    }
  }

  /**
   * Creates project
   * Configures git
   */
  public async createProject() {
    await HelperService.execute(
      'vue',
      [
        'create',
        '-i',
        '{"useConfigFiles": true,"plugins": {"@vue/cli-plugin-babel": {},"@vue/cli-plugin-pwa": {},"@vue/cli-plugin-router": {"historyMode": true},"@vue/cli-plugin-vuex": {},"@vue/cli-plugin-eslint": {"config": "prettier","lintOn": ["save","commit"]}},"vueVersion":"2"}',
        `${this.input.names.dashCase}-spa`,
      ],
      {
        cwd: this.input.projectsPath,
      }
    )
    await HelperService.execute('git', ['config', '--local', 'user.name', this.input.git.name], {
      cwd: this.input.spaPath,
    })
    await HelperService.execute('git', ['config', '--local', 'user.email', this.input.git.email], {
      cwd: this.input.spaPath,
    })
    await this.installBuefy()
  }

  public async addNavbar() {
    const filePath = `${this.input.spaPath}/src/components/NavBar.vue`
    const content = await View.render(
      `stubs/frontend/${this.input.tech.frontend}/full/src/components/navBarVue`,
      {
        input: this.input,
        auth: true, // Tell navbar that generate auth only route
      }
    )
    await HelperService.writeFile(filePath, content)
  }

  public async createSrcServicesHttpServiceJs() {
    const filePath = `${this.input.spaPath}/src/services/http.service.js`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/frontend/${this.input.tech.frontend}/full/src/services/httpServiceJs`
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  public async createSrcExceptionsValidationExceptionJs() {
    const filePath = `${this.input.spaPath}/src/exceptions/ValidationException.js`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/frontend/${this.input.tech.frontend}/full/src/exceptions/validationExceptionJs`
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  public async createSrcRouterMiddlewaresAuthMiddlewareJs() {
    const filePath = `${this.input.spaPath}/src/router/middlewares/auth.middleware.js`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/frontend/${this.input.tech.frontend}/full/src/router/middlewares/authMiddlewareJs`
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  public async createSrcRouterMiddlewaresGuestMiddlewareJs() {
    const filePath = `${this.input.spaPath}/src/router/middlewares/guest.middleware.js`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/frontend/${this.input.tech.frontend}/full/src/router/middlewares/guestMiddlewareJs`
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  public async updateSrcAppVue() {
    const filePath = `${this.input.spaPath}/src/App.vue`

    const content = await View.render(`stubs/frontend/${this.input.tech.frontend}/full/src/appVue`)
    await HelperService.writeFile(filePath, content)
  }

  protected async createSrcComponentsNavBarVue() {
    const filePath = `${this.input.spaPath}/src/components/NavBar.vue`
    const content = await View.render(
      `stubs/frontend/${this.input.tech.frontend}/full/src/components/navBarVue`,
      {
        input: this.input,
        auth: true, // Generate all routes, not nav only
      }
    )
    await HelperService.writeFile(filePath, content)
  }

  /**
   * Adds navbar and basic stuff
   */
  public async addBasicStuff() {
    await this.createSrcComponentsNavBarVue()
    await this.updateSrcAppVue()
  }

  /**
   * Steps
   * 1. Create Vue Project
   * 2. Install & Configure Buefy
   * 3. Add Common Files
   * 4. Add Auth routes
   * 5. Add Auth state
   * 6. Add Auth functionality
   * 7. Add CRUD for functionality
   */
  public async start() {
    await this.createProject()
    await this.configureBuefy()
    await this.addCommonFiles()
    await this.addBasicStuff()
    await HelperService.commit('Initial Commit', this.input.spaPath)
  }

  public async init() {
    await this.start()
  }
}