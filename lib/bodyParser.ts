import { Request, Context , multiParser} from '../deps.ts'

const decoder = new TextDecoder()

async function getBody(ctx: Context<any>): Promise<string> {
  let buffer = await Deno.readAll(ctx.req.body)
  let body = decoder.decode(buffer)
  return body
}

function getTextByHeader(ctx: Context<any>, header: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    if (ctx.req.headers.get("content-type") === header) {
      try {
        let data = await getBody(ctx)
        resolve(data)
      } catch (e) {
        reject(`bodyparser: ${header} data is invalid`)
      }
    } else {
      reject(`bodyparser: Content-Type != ${header}, can't parse text`)
    }
  })
}

export function getText(ctx: Context<any>): Promise<string> {
  return getTextByHeader(ctx, "text/plain")
}

export function getHtml(ctx: Context<any>): Promise<string> {
  return getTextByHeader(ctx, "text/html")
}

export function getJavascript(ctx: Context<any>): Promise<string> {
  return getTextByHeader(ctx, "application/javascript")
}

// TODO: xml parser
export function getXml(ctx: Context<any>) {
  return "not implement yet"
}

export function getQuery(ctx: Context<any>): Record<string, string> {
  try {
    let queryString = ctx.req.url.split("?")[1]
    let querys = queryString.split("&")
    let result: Record<string, string> = {}
    for (let q of querys) {
      let [key, value] = q.split("=")
      result[key] = value
    }
    return result
  } catch (e) {
    return {}
  }
}


export function getJSON(ctx: Context<any>): Promise<string> {
  return new Promise(async (resolve, reject) => {
    if (ctx.req.headers.get("content-type") === 'application/json') {
      let body = await getBody(ctx)
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

export function getUrlencoded(ctx: Context<any>): Promise<Record<string, string>> {
  return new Promise(async (resolve, reject) => {
    if (ctx.req.headers.get("content-type") === 'application/x-www-form-urlencoded') {
      let body = await getBody(ctx)
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

export function getGraphql(ctx: Context<any>) {
  return getJSON(ctx)
}

export function getForm(ctx: Context<any>){
  return multiParser(ctx.req)
}

// Todo: Binary save to file
export function getFile() {

}
