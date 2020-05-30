import { multiParser, ServerRequest } from '../deps.ts'
import { xmljs } from './port/xml-js.ts'
import { mime } from './port/mime.ts'

const decoder = new TextDecoder()

async function getBody(req: ServerRequest): Promise<string> {
  let buffer = await Deno.readAll(req.body)
  let body = decoder.decode(buffer)
  return body
}

function getTextByHeader(req: ServerRequest, header: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    if (req.headers.get("content-type") === header) {
      try {
        let data = await getBody(req)
        resolve(data)
      } catch (e) {
        reject(`bodyparser: ${header} data is invalid`)
      }
    } else {
      reject(`bodyparser: Content-Type != ${header}, can't parse text`)
    }
  })
}

export function getText(req: ServerRequest): Promise<string> {
  return getTextByHeader(req, "text/plain")
}

export function getHtml(req: ServerRequest): Promise<string> {
  return getTextByHeader(req, "text/html")
}

export function getJavascript(req: ServerRequest): Promise<string> {
  return getTextByHeader(req, "application/javascript")
}

export function getXml(req: ServerRequest): Promise<object> {
  return new Promise(async (resolve, reject) => {
    if (req.headers.get("content-type") === 'application/xml') {
      let body = await getBody(req)
      try {
        const parsedXml = xmljs.xml2js(body, { compact: true })
        resolve(parsedXml)
      } catch (e) {
        console.log(e)
        reject("bodyparser: XML format is invalid - " + body)
      }
    }
    else {
      reject("bodyparser: Content-Type != 'application/xml', can't parse XML")
    }
  })
}

export function getQuery(req: ServerRequest): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    try {
      let queryString = req.url.split("?")[1]
      let querys = queryString.split("&")
      let result: Record<string, string> = {}
      for (let q of querys) {
        let [key, value] = q.split("=")
        if (!result[key]) {
          result[key] = value
        }
      }
      resolve(result)
    } catch (e) {
      reject("query is invalid")
    }
  })
}


export function getJSON(req: ServerRequest): Promise<object> {
  return new Promise(async (resolve, reject) => {
    if (req.headers.get("content-type") === 'application/json') {
      let body = await getBody(req)
      try {
        const parsedJSON = JSON.parse(body)
        resolve(parsedJSON)
      } catch (e) {
        reject("bodyparser: JSON format is invalid - " + body)
      }
    }
    else {
      reject("bodyparser: Content-Type != 'application/json', can't parse JSON")
    }
  })
}

export function getUrlencoded(req: ServerRequest): Promise<Record<string, string>> {
  return new Promise(async (resolve, reject) => {
    if (req.headers.get("content-type") === 'application/x-www-form-urlencoded') {
      let body = await getBody(req)
      try {
        let queryString = decodeURIComponent(body)
        let querys = queryString.split("&")
        let result: Record<string, string> = {}
        for (let q of querys) {
          let [key, value] = q.split("=")
          if (!result[key]) {
            result[key] = value
          }
        }
        resolve(result)
      } catch (e) {
        reject("bodyparser: Urlencoded form data is invalid - " + body)
      }
    } else {
      reject("bodyparser: Content-Type != 'application/x-www-form-urlencoded', can't parse urlencoded form")
    }
  })
}

export function getGraphql(req: ServerRequest) {
  return getJSON(req)
}

export function getForm(req: ServerRequest) {
  return multiParser(req)
}

export function getFile(req: ServerRequest, fileExt: string)
  : Promise<{ ext: string, content: Uint8Array }> {
  return new Promise(async (resolve, reject) => {
    let expectContentType = mime.lookup(fileExt)
    let contentType
    if ((contentType = req.headers.get("content-type"))
      && contentType === expectContentType
    ) {
      try {
        let buffer = await Deno.readAll(req.body)
        let ext = mime.extension(contentType)

        resolve({
          ext: ext ? ext : fileExt,
          content: buffer
        })
      } catch (e) {
        reject("bodyparser: File data is invalid - " + expectContentType)
      }
    } else {
      reject(`bodyparser: Content-Type != '${expectContentType}', can't parse file data`)
    }
  })
}

export function getParams(req: ServerRequest, route: string): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    let url = req.url
    let _route = route
    try {
      let paramRegex = /\/?:(?<param>\w+)\/?/g
      let nameFound = _route.matchAll(paramRegex)
      for (let name of nameFound) {
        //    [ /:path/ , path ]
        const [originName, paramName] = name
        // convert name to regex
        _route = _route.replace(originName, `/(?<${paramName}>\\w+)/?`)
      }
      // use new regex to scan url 
      let paramsMatch = url.match(new RegExp(_route))
      let result: Record<string, string> = {}
      for (let key in paramsMatch?.groups) {
        let value = paramsMatch?.groups[key]!
        result[key] = value
      }
      resolve(result)
    } catch (e) {
      reject(`bodyparser: can't parse Params, as the route is invalid`)
    }
  })
}