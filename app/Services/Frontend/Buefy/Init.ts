import Env from '@ioc:Adonis/Core/Env'
import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'

export default class SPAGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  /**
   * Creates project
   * Configures git
   */
  public async createProject() {
    const repoUrl = Env.get('GIT_REPO_SPA_VUE_BUEFY')
    await HelperService.execute('git', ['clone', repoUrl, this.input.spaPath], {
      cwd: this.input.projectsPath,
    })
    await HelperService.execute('git', ['remote', 'remove', 'origin'], { cwd: this.input.spaPath })
    await HelperService.execute('npm', ['ci'], { cwd: this.input.spaPath })
    await HelperService.execute('git', ['config', '--local', 'user.name', this.input.git.name], {
      cwd: this.input.spaPath,
    })
    await HelperService.execute('git', ['config', '--local', 'user.email', this.input.git.email], {
      cwd: this.input.spaPath,
    })
  }

  public async updateSrcAppVue() {
    const filePath = `${this.input.spaPath}/src/App.vue`

    const content = await View.render(
      `stubs/frontend/${this.input.tech.frontend}/full/src/appVue`,
      {
        input: this.input,
      }
    )
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
   * 1. Clone project
   * 2. Add app bar and navbar
   */
  public async start() {
    await this.createProject()
    await this.addBasicStuff()
    await HelperService.commit('Initial Commit', this.input.spaPath)
  }

  public async init() {
    await this.start()
  }
}
