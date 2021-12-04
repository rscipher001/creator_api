import mkdirp from 'mkdirp'
import View from '@ioc:Adonis/Core/View'
import ProjectInput from 'App/Interfaces/ProjectInput'
import HelperService from 'App/Services/HelperService'

export default class Init {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  // Create .vscode/extensions.json
  protected async createVscodeExtenstionsJson() {
    await mkdirp(`${this.input.path}/.vscode`)
    const filePath = `${this.input.path}/.vscode/extensions.json`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(
        `stubs/backend/${this.input.tech.backend}/full/dotVscode/extensionsJson`
      )
      await HelperService.writeFile(filePath, content)
    }
  }

  // Create .nvmrc
  protected async createDotNvmrc() {
    const filePath = `${this.input.path}/.nvmrc`
    const content = await View.render(`stubs/backend/${this.input.tech.backend}/full/dotNvmrc`)
    await HelperService.writeFile(filePath, content)
  }

  protected async addPreCommitHook() {
    await HelperService.execute('npx', ['husky-init'], {
      cwd: this.input.path,
    })
    await HelperService.execute('npm', ['install'], {
      cwd: this.input.path,
    })
    const filePath = `${this.input.path}/.husky/pre-commit`
    const fileExists = await HelperService.fileExists(filePath)
    if (fileExists) {
      let content = await HelperService.readFile(filePath)
      await HelperService.writeFile(
        filePath,
        content.replace('npm test', 'npm run format\ngit add -A')
        // content.replace('npm test', 'npm run format\nnpm run build\ngit add -A')
      )
    }
  }

  public async ehancePreCommitHook() {
    const filePath = `${this.input.path}/.husky/pre-commit`
    const fileExists = await HelperService.fileExists(filePath)
    if (fileExists) {
      let content = await HelperService.readFile(filePath)
      await HelperService.writeFile(
        filePath,
        content.replace('npm run format\ngit add -A', 'npm run format\nnpm run build\ngit add -A')
      )
    }
  }

  /**
   * Steps
   * 0. Determine project type
   * 1. Create Project
   * 2. Add .vscode folder
   * 3. Setup git repo
   * 4. Initial commit
   * 5. Add pre commit hooks
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
        `--boilerplate=${type.toLocaleLowerCase()}`, // api/web
        `--name=${this.input.name}`, // Project name
        '--eslint', // Enable ESLint
        '--prettier', // Enable prettiter
      ],
      {
        cwd: this.input.projectsPath,
      }
    )
    // 2. Add .vscode folder
    await this.createVscodeExtenstionsJson()
    await this.createDotNvmrc()

    // 3. Initiate git repo
    await HelperService.execute('git', ['init'], {
      cwd: this.input.path,
    })

    await HelperService.execute('git', ['config', '--local', 'user.name', this.input.git.name], {
      cwd: this.input.path,
    })
    await HelperService.execute('git', ['config', '--local', 'user.email', this.input.git.email], {
      cwd: this.input.path,
    })

    // 4. Initial commit
    await HelperService.commit('Initial Commit', this.input.path)

    // 5. Add pre commit hook
    await this.addPreCommitHook()
    await HelperService.commit('Pre commit hook added', this.input.path)
  }

  public async init() {
    await this.start()
  }
}
