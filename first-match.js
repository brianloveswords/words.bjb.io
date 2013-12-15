module.exports = function firstMatch(regexp, strings) {
  const len = strings.length
  var string, i
  for (i = 0; i < len; i++) {
    string = strings[i]
    if (regexp.test(string))
      return string
  }
}
