import { Server } from 'socket.io'
import { createHash } from 'crypto'
import Database from '@ioc:Adonis/Lucid/Database'
import AdonisServer from '@ioc:Adonis/Core/Server'
import { base64, safeEqual } from '@ioc:Adonis/Core/Helpers'

class Ws {
  public io: Server
  private booted = false

  public boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(AdonisServer.instance!, {
      cors: {
        origin: 'http://localhost:8081',
        credentials: true,
      },
    })
    this.io.on('connection', async (client) => {
      const token: string = client.handshake.auth?.token
      if (token) {
        const parts = token.split('.')

        if (parts.length === 2) {
          const tokenId = base64.urlDecode(parts[0], undefined, true)
          if (tokenId) {
            const tokens = await Database.query()
              .where({
                id: tokenId,
              })
              .from('api_tokens')
              .select('*')
            let token
            if (tokens.length) token = tokens[0]
            const parsedToken = { tokenId, value: parts[1] }
            const hash = createHash('sha256').update(parsedToken.value).digest('hex')
            if (safeEqual(token.token, hash)) {
              client.join(`output_${token.user_id}`)
            }
          }
        }
      }
    })
  }
}

export default new Ws()
