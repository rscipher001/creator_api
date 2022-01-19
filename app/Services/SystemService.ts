import HelperService from 'App/Services/HelperService'

class SystemService {
  protected async ensureNginxIsInstalled() {}
  protected async ensureVueCliIsInstalled() {}
  protected async ensureNodeJsIsInstalled() {
    await HelperService.execute('command', ['-v', 'node'])
  }
  protected async ensurePm2IsInstalled() {}

  public async ensureGeneratorToolsAreInstalled() {
    await this.ensureNodeJsIsInstalled()
    await this.ensureVueCliIsInstalled()
    return true
  }

  public async ensureHostingToolsAreInstalled() {
    await this.ensurePm2IsInstalled()
    await this.ensureNginxIsInstalled()
  }
}

export default new SystemService()
