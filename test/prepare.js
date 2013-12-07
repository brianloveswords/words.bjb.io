const path = require('path')
const fs = require('fs')
const db = require('streamsql').connect({
  driver: 'sqlite3',
  filename: ':memory:',
})

module.exports = function (callback) {
  const schemaPath = path.join(__dirname, '..', 'schemas.sql')
  const schemas = fs.readFileSync(schemaPath)
    .toString('utf8')
    .split(';')
    .map(method('trim'))
    .filter(prop('length'))
    .forEach(execute(done))

  function done(error, results) {
    if (error) throw error
    return callback(db)
  }
}

function execute(done) {
  const results = []
  var globalError
  var counter = 0
  return function (sql, idx) {
    counter ++
    db.query(sql, function (error, result) {
      counter --
      if (globalError) return
      if (error) {
        globalError = error
        return done(error)
      }
      results[idx] = result
      if (counter == 0)
        return done(null, results)
    })
  }
}

function prop(name) {
  return function (obj) { return obj[name] }
}

function method(name) {
  return function (obj) { return obj[name]() }
}
