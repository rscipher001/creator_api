import fs from 'fs'
import { promisify } from 'util'
import View from '@ioc:Adonis/Core/View'
import { string } from '@ioc:Adonis/Core/Helpers'
import { spawn, SpawnOptions } from 'child_process'
import { Names, ExtendedNames } from 'App/Interfaces/ProjectInput'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const copyFile = promisify(fs.copyFile)
const readdir = promisify(fs.readdir)
const access = promisify(fs.access)

interface Options {
  cwd?: string
  stdio?: string
  env?: any
}

class HelperService {
  public writeFile = writeFile
  public copyFile = copyFile
  public readdir = readdir

  public async readFile(path: string) {
    return (await readFile(path)).toString()
  }

  public async fileExists(path: string): Promise<boolean> {
    try {
      await access(path, fs.constants.F_OK)
      return true
    } catch (_) {
      return false
    }
  }

  public readJson = async (path: string) => JSON.parse(await this.readFile(path))
  public writeJson = async (path: string, content: string) =>
    this.writeFile(path, JSON.stringify(content, null, 2))

  public execute = (
    command: string,
    args: string[] = [],
    options: Options = {
      stdio: 'inherit',
    }
  ) =>
    new Promise((resolve, reject) => {
      if (options) {
        options.stdio = 'inherit'
      }
      const stream = spawn(command, args, options as SpawnOptions)
      stream.on('error', (e) => reject(e))
      stream.on('close', (code) => resolve(code))
    })

  public commit = async (message: string, projectPath: string) => {
    await this.execute('git', ['add', '-A'], {
      cwd: projectPath,
    })
    await this.execute('git', ['commit', '-m', message], {
      cwd: projectPath,
    })
  }

  public appendContentToFile = async (path: string, content: string) => {
    const fileContent = (await this.readFile(path)).toString()
    const updatedContent = fileContent + content
    await this.writeFile(path, updatedContent)
  }

  /**
   * Generates main cases for input
   */
  public generateNames(name): Names {
    return {
      camelCase: string.camelCase(name),
      camelCasePlural: string.camelCase(string.pluralize(name)),
      snakeCase: string.snakeCase(name),
      snakeCasePlural: string.snakeCase(string.pluralize(name)),
      pascalCase: string.pascalCase(name),
      pascalCasePlural: string.pascalCase(string.pluralize(name)),
    }
  }

  /**
   * Generates all cases for input
   */
  public generateExtendedNames(name): ExtendedNames {
    return {
      ...this.generateNames(name),
      dashCase: string.dashCase(name),
      dashCasePlural: string.dashCase(string.pluralize(name)),
    }
  }

  public async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public insertLines(content, index, newLines) {
    return content.substring(0, index) + newLines + content.substr(index)
  }

  public toSingularPascalCase(input: string) {
    return string.pascalCase(string.singularize(input))
  }

  public toSingularCameCase(input: string) {
    return string.camelCase(string.singularize(input))
  }

  public toSingularSnakeCase(input: string) {
    return string.snakeCase(string.singularize(input))
  }

  // Handle dotFile naming
  public replaceDotWithDotKeyword(input: string) {
    if (input[0] === '.') {
      return `dot${input.slice(1, 2).toUpperCase()}${input.slice(2)}`
    }
    return input
  }

  /**
   * Copy generic files that doesn't need logical manupulation
   * @param path File path
   * @param cwd Project Directory
   * @param options Options to pass to views
   */
  public async writeGenericFile(path: string, cwd: string, options?: unknown) {
    const viewPath = `stubs/app/Flutter/full/${this.replaceDotWithDotKeyword(path)
      .split('.')
      .map((inputString, index) => {
        if (index > 0) return string.pascalCase(inputString)
        else return inputString
      })
      .join('')}.edge`
    const destinationPath = `${cwd}/${path}`
    const content = await View.render(viewPath, options)
    await this.writeFile(destinationPath, content)
  }

  /**
   * Inserts lines in file
   * @param searchInput Searches given string and inserts lines after the line where string exists
   * @param linesToInsert Lines that needs to be insert
   * @param filePath File in context
   */
  public async insertLinesAfter(searchInput, linesToInsert, filePath) {
    const content = await this.readFile(filePath)
    let searchInputEnd = content.indexOf(searchInput) + searchInput.length
    let insertAtEndOfFile = false

    /**
     * Searching where search input line ends
     * New lines will be insert after line end
     * If search input line doesn't end then new lines will be insert
     * At the end of the file
     */
    let shouldStillLookForLineEnding = true
    while (shouldStillLookForLineEnding) {
      if (content[searchInputEnd] === '\n') {
        shouldStillLookForLineEnding = false
      } else if (searchInputEnd === content.length) {
        insertAtEndOfFile = true
        shouldStillLookForLineEnding = false
      }
      // One increment is required after matching
      searchInputEnd++
    }

    if (insertAtEndOfFile) {
      const newContent = content + '\n' + linesToInsert
      await this.writeFile(filePath, newContent)
    } else {
      const newContent = this.insertLines(content, searchInputEnd, linesToInsert)
      await this.writeFile(filePath, newContent)
    }
  }
}

export default new HelperService()
