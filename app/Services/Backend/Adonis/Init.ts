import HelperService from 'App/Services/HelperService'
import ProjectInput from 'App/Interfaces/ProjectInput'

export default class Init {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  /**
   * Steps
   * 0. Determine project type
   * 1. Create Project
   * 2. Setup git repo
   * 3. Initial commit
   */
  protected async start() {
    let type: string
    if (this.input.types.length === 1) {
      type = this.input.types[0]
    } else {
      type = 'web'
    }

    // 1. Create Proejct
    await HelperService.execute(
      'npm',
      [
        'init',
        'adonis-ts-app@latest',
        this.input.basePath, // ProjectPath
        `--boilerplate=${type}`, // Don't install views
        `--name=${this.input.name}`, // Project name
        '--eslint', // Enable ESLint
        '--prettier', // Enable prettiter
      ],
      {
        cwd: this.input.projectsPath,
      }
    )

    // 2. Initiate git repo
    await HelperService.execute('git', ['init'], {
      cwd: this.input.path,
    })

    await HelperService.execute('git', ['config', '--local', 'user.name', this.input.git.name], {
      cwd: this.input.path,
    })
    await HelperService.execute('git', ['config', '--local', 'user.email', this.input.git.email], {
      cwd: this.input.path,
    })

    // 3 Initial commit
    await HelperService.commit('Initial Commit', this.input.path)
  }

  public async init() {
    await this.start()
  }
}
