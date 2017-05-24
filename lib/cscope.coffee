spawn = require('child_process').spawn
path = require 'path'
fs = require 'fs'

mapPromise = (p, f) ->
  new Promise (resolve, reject) ->
    p.then (x) -> resolve (f x), (e) -> reject e

fixOneLine = (line) ->
  data = line.split(" ", 3)
  data.push(line.replace(data.join(" ") + " ", ""))
  info =
    fileName: data[0]
    functionName: data[1]
    lineNumber: parseInt data[2]
    lineText: data[3]
  return info

fixCscopeResults = (res) ->
  res.split('\n')
    .map (e, i, a) -> e.trim()
    .filter (e, i, a) -> e.length > 0
    .map (e, i, a) -> fixOneLine e

runCommand = (wd, command, args) ->
  new Promise (resolve, reject) =>
    output = ''
    # console.log "command: #{command}, args: #{args}, options: #{options}"
    child = spawn command, args, { cwd: wd }
    child.stdout.on 'data', (data) =>
      output += data.toString()
    child.stderr.on 'data', (data) =>
      reject new Error "cscope stderr: " + data.toString()
    child.on 'error', (err) =>
      reject err
    child.on 'close', (code) =>
      # console.log "Closed command with " + code
      if code != 0
        reject new Error "cscope return value: " + code
      else
        resolve output

module.exports = Cscope =

  # list of the project directories that have cscope.out files
  dbs: []

  # refresh @dbs
  refresh: ->
    promises = atom.project.getPaths().map (p) ->
      fullPath = path.join(p, 'cscope.out')
      new Promise (resolve, reject) ->
        fs.access fullPath, fs.R_OK | fs.W_OK, (err) ->
          if err
            reject err
          else
            resolve p
    @_filterPromises promises
      .then (ls) => @dbs = ls

  _cscope2: (keyword, num) ->
    cscopeBinary = atom.config.get('atom-select-list-test.cscopeBinaryLocation')
    ps = @dbs.map (path) =>
      mapPromise (runCommand path, cscopeBinary, ['-dL' + num, keyword]), fixCscopeResults
    mapPromise Promise.all(ps), (aa) =>
      [].concat.apply([], aa)

  cscope: (keyword, num) ->
    if @dbs.length == 0
      @refresh()
        .then =>
          if @dbs.length == 0
            Promise.resolve []
          else
            @dbs.forEach (p) -> console.log "- #{p}"
            @_cscope2 keyword, num
    else
      @_cscope2 keyword, num

  # The argument is an array of promises
  # The function returns an array of results of all resolved promises
  _filterPromises: (promiseArray) ->
    ret = []
    promiseArray.forEach (p) -> p.then (v) ->
        ret.push(v)
        Promise.resolve(null)
      (err) ->
        Promise.resolve(null)
    Promise.all(promiseArray).then =>
      ret
