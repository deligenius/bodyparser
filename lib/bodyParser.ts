import { ServerRequest, multiParser, FormFile } from '../deps.ts'

export class BodyParser {
  #request: ServerRequest
  #decoder: TextDecoder
  #body: () => Promise<string>

  constructor(request: ServerRequest) {
    this.#request = request
    this.#decoder = new TextDecoder()
    this.#body = this.getBody
  }

  private async getBody(): Promise<string> {
    return this.#decoder.decode(await Deno.readAll(this.#request.body))
  }

  private getTextByHeader(header: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.#request.headers.get("content-type") === header) {
        try {
          let data = await this.#body()
          resolve(data)
        } catch (e) {
          reject(`bodyparser: ${header} data is invalid`)
        }
      } else {
        reject(`bodyparser: Content-Type != ${header}, can't parse text`)
      }
    })
  }

  getText(): Promise<string> {
    return this.getTextByHeader("text/plain")
  }

  getHtml(): Promise<string> {
    return this.getTextByHeader("text/html")
  }

  getJavascript(): Promise<string> {
    return this.getTextByHeader("application/javascript")
  }

  // TODO: xml parser
  getXml() {
    return "not implement yet"
  }

  getQuery(): Record<string, string> {
    let { hostname, port } = <Deno.NetAddr>this.#request.conn.localAddr
    let url = new URL(this.#request.url, `http://${hostname}:${port}`)
    let query: Record<string, string> = {}
    for (let [key, value] of url.searchParams.entries()) {
      if (!query[key]) query[key] = value
    }
    return query
  }


  getJSON(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.#request.headers.get("content-type") === 'application/json') {
        let body = await this.#body()
        try {
          const parsedJSON = JSON.parse(body)
          resolve(parsedJSON)
        } catch (e) {
          reject("bodyparser: JSON data is invalid")
        }
      }
      else {
        reject("bodyparser: Content-Type != 'application/json', can't parse JSON")
      }
    })
  }

  getUrlencoded(): Promise<Record<string, string>> {
    return new Promise(async (resolve, reject) => {
      if (this.#request.headers.get("content-type") === 'application/x-www-form-urlencoded') {
        let body = await this.#body()
        try {
          const searchParams = new URLSearchParams(body)
          const form: Record<string, string> = {}
          for (let [key, value] of searchParams.entries()) {
            if (!form[key]) {
              form[key] = value
            }
          }
          resolve(form)
        } catch (e) {
          reject("bodyparser: Urlencoded form data is invalid - " + body)
        }
      } else {
        reject("bodyparser: Content-Type != 'application/x-www-form-urlencoded', can't parse urlencoded form")
      }
    })
  }

  getMultipart(): Promise<Record<string, FormFile | string>> {
    return new Promise(async (resolve, reject) => {
      if (this.#request.headers.get("content-type")?.startsWith("multipart/form-data")) {
        try {
          const form = await multiParser(this.#request)
          resolve(form)
        } catch (e) {
          reject("bodyparser: multipart/form-data data is invalid")
        }
      } else {
        reject("bodyparser: Content-Type not start with 'multipart/form-data', can't parse form")
      }
    })
  }

  getGraphql() {
    return this.getJSON()
  }

  getFile(){
    
  }

}