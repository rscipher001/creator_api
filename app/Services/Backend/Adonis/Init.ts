import Env from '@ioc:Adonis/Core/Env'
import ProjectInput from 'App/Interfaces/ProjectInput'
import HelperService from 'App/Services/HelperService'
import { Storage, Mailer, Database } from 'App/Interfaces/Enums'

export default class Init {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
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
    await HelperService.commit('Pre commit hook updated', this.input.path)
  }

  protected async installAllDependencies() {
    const dependencies: string[] = []
    const devDependencies: string[] = []

    if (this.input.database === Database.MySQL) {
      dependencies.push('mysql')
    } else if (this.input.database === Database.PostgreSQL) {
      dependencies.push('pg')
    } else if (this.input.database === Database.OracleDB) {
      dependencies.push('oracledb')
    } else if (this.input.database === Database.MSSQL) {
      dependencies.push('tedious')
    } else if (this.input.database === Database.SQLite) {
      dependencies.push('sqlite3')
    }

    if (this.input.storageEnabled) {
      dependencies.push('@adonisjs/attachment-lite')
      if (this.input.storageDrivers.includes(Storage.S3)) {
        dependencies.push('@adonisjs/drive-s3')
      }
      if (this.input.storageDrivers.includes(Storage.GCS)) {
        dependencies.push('@adonisjs/drive-gcs')
      }
    }
    if (this.input.rbac.enabled) {
      dependencies.push('@adonisjs/bouncer')
    }
    if (this.input.mailEnabled) {
      dependencies.push('@adonisjs/mail')
      dependencies.push('@adonisjs/view')
      if (this.input.mailers.includes(Mailer.SES)) {
        dependencies.push('aws-sdk')
      }
    }
    if (dependencies.length) {
      await HelperService.execute('npm', ['i', ...dependencies], {
        cwd: this.input.path,
      })
    }
    if (devDependencies.length) {
      await HelperService.execute('npm', ['i', '-D', ...devDependencies], {
        cwd: this.input.path,
      })
    }
  }

  /**
   * Steps
   * 0. Determine project type
   * 1. Clone Project
   * 2. Install all dependencies
   * 3. Initial commit
   */
  protected async start() {
    let type: string
    if (this.input.types.length === 1) {
      type = this.input.types[0]
    } else {
      type = 'web'
    }

    // 1. Clone starter proejct
    let repoUrl = Env.get('GIT_REPO_API_ADONIS')
    if (type === 'web') {
      repoUrl = Env.get('GIT_REPO_WEB_ADONIS')
    }

    // Clone project
    await HelperService.execute('git', ['clone', repoUrl, this.input.path], {
      cwd: this.input.projectsPath,
    })

    // Install dependencies
    await HelperService.execute('git', ['remote', 'remove', 'origin'], { cwd: this.input.path })
    await HelperService.execute('npm', ['ci'], { cwd: this.input.path })

    // 2. Install all dependencies
    await this.installAllDependencies()
    await HelperService.copyFile(`${this.input.path}/.env.example`, `${this.input.path}/.env`)

    await HelperService.execute('git', ['config', '--local', 'user.name', this.input.git.name], {
      cwd: this.input.path,
    })
    await HelperService.execute('git', ['config', '--local', 'user.email', this.input.git.email], {
      cwd: this.input.path,
    })

    // 4. Initial commit
    await HelperService.commit('Initial generator commit', this.input.path)
  }

  public async init() {
    await this.start()
  }
}
