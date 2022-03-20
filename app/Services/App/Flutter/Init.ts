import YAML from 'yamljs'
import mkdirp from 'mkdirp'
import View from '@ioc:Adonis/Core/View'
import HelperService from 'App/Services/HelperService'
import ProjectInput, { Table } from 'App/Interfaces/ProjectInput'

export default class AppGenerator {
  private input: ProjectInput

  constructor(input: ProjectInput) {
    this.input = input
  }

  /**
   * Creates project
   */
  protected async createProject() {
    await HelperService.execute(
      'flutter',
      ['create', '--org', this.input.app!.packageName, 'app'],
      {
        cwd: this.input.projectsPath,
      }
    )
  }

  protected async addReadme() {
    const viewPath = `stubs/app/Flutter/full/readmeMe`
    const content = await View.render(viewPath, {
      input: this.input,
    })
    await HelperService.writeFile(`${this.input.appPath!}/README.md`, content)
  }

  /**
   * Adds packages like http, shared pref, etc
   */
  protected async addPackages() {
    const dependencies = {
      connectivity: '3.0.6',
      http: '0.13.4',
      image_picker: '0.8.4+3',
      provider: '6.0.1',
      shared_preferences: '2.0.8',
      validators: '3.0.0',
    }
    let linesToInsert = ''
    for (const key in dependencies) {
      /**
       * 2 space indentation is important, it is a yaml file
       */
      linesToInsert += `  ${key}: ${dependencies[key]}\n`
    }
    const targetPath = `${this.input.appPath!}/pubspec.yaml`
    await HelperService.insertLinesAfter('cupertino_icons', linesToInsert, targetPath)
  }

  protected async updatePubspecYaml() {
    const dependencies = {
      connectivity: '3.0.6',
      http: '0.13.4',
      image_picker: '0.8.4+3',
      provider: '6.0.1',
      shared_preferences: '2.0.8',
      validators: '3.0.0',
    }
    const targetPath = `${this.input.appPath!}/pubspec.yaml`
    const targetContent = await HelperService.readFile(targetPath)
    const pubspecJsObject = YAML.parse(targetContent)
    for (const key in dependencies) {
      pubspecJsObject.dependencies[key] = dependencies[key]
    }
    const pubspecYamlObject = YAML.stringify(pubspecJsObject)
    await HelperService.writeFile(targetPath, pubspecYamlObject)
  }

  protected async addConfig() {
    const cwd = this.input.appPath!
    await mkdirp(`${cwd}/lib/config`)
    await HelperService.writeGenericFile('lib/config/constants.dart', cwd)
  }

  /**
   * Adds servies like http servie, auth service, etc
   */
  protected async addServices() {
    const cwd = this.input.appPath!
    const input = { input: this.input }
    await mkdirp(`${cwd}/lib/services`)
    await HelperService.writeGenericFile('lib/services/http.service.dart', cwd, input)
    await HelperService.writeGenericFile('lib/services/auth.service.dart', cwd, input)
    await HelperService.writeGenericFile('lib/services/sharedPreference.service.dart', cwd, input)
  }

  /**
   * Adds exceptions like auth exceptions, etc
   */
  protected async addExcepetions() {
    const cwd = this.input.appPath!
    await mkdirp(`${this.input.appPath!}/lib/exceptions`)
    await HelperService.writeGenericFile('lib/exceptions/auth.exception.dart', cwd)
    await HelperService.writeGenericFile('lib/exceptions/server.exception.dart', cwd)
    await HelperService.writeGenericFile('lib/exceptions/unknown.exception.dart', cwd)
    await HelperService.writeGenericFile('lib/exceptions/validation.exception.dart', cwd)
  }

  /**
   * Add models like user model
   */
  protected async addModels() {
    const cwd = this.input.appPath!
    await mkdirp(`${cwd}/lib/models`)
    await HelperService.writeGenericFile('lib/models/user.model.dart', cwd, {
      input: this.input,
    })
    await HelperService.writeGenericFile('lib/models/pagination_meta.model.dart', cwd, {
      input: this.input,
    })
  }

  /**
   * Add models like user model
   */
  protected async addStates() {
    const cwd = this.input.appPath!
    await mkdirp(`${cwd}/lib/state`)
    await HelperService.writeGenericFile('lib/state/auth.state.dart', cwd, {
      input: this.input,
    })
  }

  /**
   * Add interfaces like login request, register request, etc
   */
  protected async addInterfaces() {
    const cwd = this.input.appPath!
    await mkdirp(`${cwd}/lib/interfaces/auth`)
    await HelperService.writeGenericFile('lib/interfaces/auth/login.interface.dart', cwd, {
      input: this.input,
    })
    await HelperService.writeGenericFile('lib/interfaces/auth/register.interface.dart', cwd, {
      input: this.input,
    })
  }

  /**
   * Add components like drawer
   */
  protected async addComponents() {
    const cwd = this.input.appPath!
    await mkdirp(`${cwd}/lib/components/global`)
    await HelperService.writeGenericFile('lib/components/global/my_drawer.dart', cwd, {
      input: this.input,
    })
  }

  /**
   * Add views like login view, register view, etc
   */
  protected async addViews() {
    const cwd = this.input.appPath!
    await mkdirp(`${cwd}/lib/pages/auth`)
    await HelperService.writeGenericFile('lib/pages/auth/login.dart', cwd, {
      input: this.input,
    })
    await HelperService.writeGenericFile('lib/pages/auth/register.dart', cwd, {
      input: this.input,
    })
    await HelperService.writeGenericFile('lib/pages/dashboard.dart', cwd, {
      input: this.input,
    })
    await HelperService.writeGenericFile('lib/pages/homepage.dart', cwd, {
      input: this.input,
    })
  }

  protected async addMain() {
    const cwd = this.input.appPath!
    await HelperService.writeGenericFile('lib/main.dart', cwd, {
      input: this.input,
    })
  }

  protected async addGithuActions() {
    const cwd = this.input.appPath!
    await mkdirp(`${cwd}/.github/workflows`)
    await HelperService.writeGenericFile('.github/workflows/build.yaml', cwd)
    await HelperService.writeGenericFile('.github/workflows/test.yaml', cwd)
  }

  protected async addTests() {
    const cwd = this.input.appPath!
    await mkdirp(`${cwd}/integration_test`)
    await this.addTestDependenciesInPubspec()
    await HelperService.writeGenericFile('integration_test/app_test.dart', cwd, {
      input: this.input,
    })
  }

  protected async addTestDependenciesInPubspec() {
    const devDependencies = {
      integration_test: {
        sdk: 'flutter',
      },
    }
    const targetPath = `${this.input.appPath!}/pubspec.yaml`
    const targetContent = await HelperService.readFile(targetPath)
    const pubspecJsObject = YAML.parse(targetContent)
    for (const key in devDependencies) {
      pubspecJsObject.dev_dependencies[key] = devDependencies[key]
    }
    const pubspecYamlObject = YAML.stringify(pubspecJsObject, 3, 2)
    await HelperService.writeFile(targetPath, pubspecYamlObject)
  }

  protected async addModel(table: Table) {
    const filePath = `${this.input.appPath}/lib/models/${table.names.snakeCase}.model.dart`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(`stubs/app/Flutter/full/lib/models/modelDart`, {
        input: this.input,
        table,
      })
      await HelperService.writeFile(filePath, content)
    }
  }

  /**
   * Add states
   * - index
   * - filter
   * - show
   */
  protected async addModelStates(table: Table) {
    const types = ['index', 'filter', 'show', 'edit']
    for (const index in types) {
      const type = types[index]
      if (['index', 'filter'].includes(type) && !table.operations.index) return
      if (type === 'show' && !table.operations.show) return
      if (type === 'edit' && !table.operations.edit) return
      const filePath = `${this.input.appPath}/lib/state/${table.names.snakeCase}_${type}.state.dart`
      const fileExists = await HelperService.fileExists(filePath)
      if (!fileExists) {
        const content = await View.render(`stubs/app/Flutter/full/lib/state/model_${type}Dart`, {
          input: this.input,
          table,
        })
        await HelperService.writeFile(filePath, content)
      }
    }
  }

  protected async addModelViews(table: Table) {
    const types = ['index', 'filter', 'create']
    for (const index in types) {
      const type = types[index]
      if (['index', 'filter'].includes(type) && !table.operations.index) return
      if (type === 'create' && !table.operations.create) return
      const filePath = `${this.input.appPath}/lib/pages/${table.names.snakeCase}_${type}.dart`
      const fileExists = await HelperService.fileExists(filePath)
      if (!fileExists) {
        const content = await View.render(`stubs/app/Flutter/full/lib/pages/model_${type}Dart`, {
          input: this.input,
          table,
        })
        await HelperService.writeFile(filePath, content)
      }
    }
  }

  protected async addModelService(table: Table) {
    const filePath = `${this.input.appPath}/lib/services/${table.names.snakeCase}.service.dart`
    const fileExists = await HelperService.fileExists(filePath)
    if (!fileExists) {
      const content = await View.render(`stubs/app/Flutter/full/lib/services/model_serviceDart`, {
        input: this.input,
        table,
      })
      await HelperService.writeFile(filePath, content)
    }
  }

  /**
   * Steps
   * - Add model
   * - Add state for index, show and filter
   * - Add view for show and index
   * - Add service
   */
  protected async addCRUD() {
    for (let i = 0; i < this.input.tables.length; i += 1) {
      const table = this.input.tables[i]
      await this.addModel(table)
      await this.addModelStates(table)
      await this.addModelViews(table)
      await this.addModelService(table)
    }
  }

  /**
   * Steps
   * - Init
   * - Add Readme
   * - Add packages
   * - Add config
   * - Add services
   * - Add exceptions
   * - Add interfaces
   * - Add models
   * - Add state
   * - Add components
   * - Add views
   * - Add main file
   * - Add github actions
   * - Add tests
   * - Add CRUD operations
   */
  public async start() {
    const cwd = this.input.appPath!
    const commit = async (message: string, projectPath: string) => {
      await await execute('flutter', ['format', 'lib'], { cwd })
      await HelperService.commit(message, projectPath)
    }
    const execute = HelperService.execute
    await execute('rm', ['-rf', cwd])
    await this.createProject()

    await execute('git', ['init'], { cwd })
    await commit('Initial Commit', cwd)

    await this.addReadme()
    await commit('README.md added', cwd)

    await this.addPackages()
    await execute('flutter', ['pub', 'get'], { cwd })
    await commit('Packages added', cwd)

    await this.addConfig()
    await commit('Config added', cwd)

    await this.addServices()
    await commit('Services added', cwd)

    await this.addExcepetions()
    await commit('Exceptions added', cwd)

    await this.addInterfaces()
    await commit('Interfaces added', cwd)

    await this.addModels()
    await commit('Models added', cwd)

    await this.addStates()
    await commit('States added', cwd)

    await this.addComponents()
    await commit('Components added', cwd)

    await this.addViews()
    await commit('Views added', cwd)

    await this.addCRUD()
    await commit('CRUD Added', cwd)

    await this.addMain()
    await commit('Main added', cwd)

    await this.addGithuActions()
    await commit('Github actions added', cwd)

    await this.addTests()
    await execute('flutter', ['pub', 'get'], { cwd })
    await commit('Tests added', cwd)
  }

  public async init() {
    await this.start()
  }
}
