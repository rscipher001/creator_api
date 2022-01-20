import execa from 'execa'

class SystemService {
  protected async runCommand(command, args: string[] = []) {
    try {
      const output = await execa(command, args)
      return output.stdout + output.stderr
    } catch (_) {
      return false
    }
  }
  public async systemStatus() {
    try {
      return {
        nginx: await this.runCommand('nginx', ['-v']),
        node: await this.runCommand('node', ['-v']),
        mysql: await this.runCommand('mysql', ['--version']),
        vue: await this.runCommand('vue', ['--version']),
        pm2: await this.runCommand('pm2', ['--version']),
      }
    } catch (_) {
      return {
        status: 'failed',
      }
    }
  }
}

export default new SystemService()
