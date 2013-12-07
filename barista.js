module.exports = function barista(stack, errorHandler) {
  if (!errorHandler) {
    errorHandler = function intServerError(req, res, error) {
      res.writeHead(500)
      res.write('Internal Server Error')
      if (error)
        res.write(': ' + error.message)
      res.end()
    }
  }

  return function initiate(req, res) {
    const context = {}
    const next = process.bind(context, req, res)
    var idx = 0

    function process(req, res, error) {
      if (error)
        return errorHandler.call(context, req, res, error)
      const handler = stack[idx++]
      if (!handler)
        return errorHandler.call(context, req, res, new Error('fallthrough'))
      return handler.call(context, req, res, next, errorHandler)
    }
    return process(req, res)
  }
}
