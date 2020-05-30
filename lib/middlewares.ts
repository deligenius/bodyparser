import { bodyParser } from "../mod.ts"
import { Context } from '../deps.ts'

export function query() {
  return async function (ctx: Context<any>, next: Function) {
    try {
      ctx.req.query = await bodyParser.getQuery(ctx.req)
    }
    catch (e) {
      ctx.req.query = {}
    }
    next()
  }
}

export function params(route: string) {
  return async function (ctx: Context<any>, next: Function) {
    try {
      ctx.req.params = await bodyParser.getParams(ctx.req, route)
    }
    catch (e) {
      ctx.req.params = {}
    }
    next()
  }
}

export function json() {
  return async function (ctx: Context<any>, next: Function) {
    try {
      ctx.req.json = await bodyParser.getJSON(ctx.req)
    }
    catch (e) {
      ctx.req.json = {}
    }
    next()
  }
}

export function urlencoded() {
  return async function (ctx: Context<any>, next: Function) {
    try {
      ctx.req.urlencoded = await bodyParser.getUrlencoded(ctx.req)
    }
    catch (e) {
      ctx.req.urlencoded = {}
    }
    next()
  }
}

export function text() {
  return async function (ctx: Context<any>, next: Function) {
    try {
      ctx.req.text = await bodyParser.getText(ctx.req)
    }
    catch (e) {
      ctx.req.text = ""
    }
    next()
  }
}

export function html() {
  return async function (ctx: Context<any>, next: Function) {
    try {
      ctx.req.html = await bodyParser.getHtml(ctx.req)
    }
    catch (e) {
      ctx.req.html = ""
    }
    next()
  }
}

export function javascript() {
  return async function (ctx: Context<any>, next: Function) {
    try {
      ctx.req.javascript = await bodyParser.getJavascript(ctx.req)
    }
    catch (e) {
      ctx.req.javascript = ""
    }
    next()
  }
}

export function xml() {
  return async function (ctx: Context<any>, next: Function) {
    try {
      ctx.req.xml = await bodyParser.getXml(ctx.req)
    }
    catch (e) {
      ctx.req.xml = {}
    }
    next()
  }
}

export function graphql() {
  return async function (ctx: Context<any>, next: Function) {
    try {
      ctx.req.graphql = await bodyParser.getGraphql(ctx.req)
    }
    catch (e) {
      ctx.req.graphql = {}
    }
    next()
  }
}

export function file(fileExt: string) {
  return async function (ctx: Context<any>, next: Function) {
    try {
      ctx.req.file = await bodyParser.getFile(ctx.req, fileExt)
    }
    catch (e) {
      ctx.req.file = undefined
    }
    next()
  }
}
