const fs = require('fs')
const http = require('http')
const marked = require('marked')
const routes = require('routes')
const ecstatic = require('ecstatic')
const path = require('path')
const nunjucks = require('nunjucks')
const url = require('url')
const barista = require('./barista')

const env = process.env;
const postDir = env.POSTS || path.join(__dirname, 'posts')
const templatesDir = env.TEMPLATES || path.join(__dirname, 'templates')
const staticDir = env.STATIC || path.join(__dirname, 'static')

nunjucks.configure(templatesDir)
const static = ecstatic({
  root: staticDir,
  handleError: false,
})

const server = http.createServer(barista([
  static,
  getPosts,
  route,
]))

function getPosts(req, res, next) {
  const self = this
  fs.readdir(postDir, function (err, dirs) {
    if (err) return next(err)
    self.posts = dirs
    return next()
  })
}

function route(req, res, next) {
  const posts = this.posts
  const urlParts = url.parse(req.url)

  const pathname = urlParts.pathname
  const post = pathname.slice(1, pathname.length - 1)
  if (pathname == '/')
    return renderIndex(req, res)

  if (posts.indexOf(post) !== -1) {
    this.pathname = pathname
    this.post = post
    return renderPost.call(this, req, res, next)
  }
  res.write('okay lol')
  res.end()
}

function renderIndex(req, res) {
  res.write('index')
  res.end()
}

function renderPost(req, res, next) {
  const file = path.join(postDir, this.pathname, 'index.md')
  parseMarkdown(file, function (err, context) {
    if (err) return next(err)
    res.write(nunjucks.render('post.html', context))
    res.end()
  })
}

function parseMarkdown(file, callback) {
  fs.readFile(file, function (err, content) {
    if (err) return callback(err)
    return callback(null, {
      content: marked(content.toString('utf8'))
    })
  })
}

if (!module.parent) {
  server.listen(env.PORT || env.SOCKET || 3000, function () {
    console.error('listening %j', this.address())
  })
}
