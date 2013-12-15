const test = require('tap').test
const firstMatch = require('../first-match')

test('first match', function (t) {
  t.same('c.yml', firstMatch(/\.yml$/, w('a b c.yml d.yml')))
  t.same('a.md', firstMatch(/\.md$/, w('a.md d.yml')))
  t.same(undefined, firstMatch(/\.md$/, w('a.ham d.sandwich')))
  t.end()
})

function w(s) { return s.split(/ +/) }
