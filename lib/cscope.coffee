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

# FIXME: rework this function
# FIXME: keep stream interface for this module
runCommand = (command, args, options = {}) ->
  process = new Promise (resolve, reject) =>
    output = ''
    # console.log "command: #{command}, args: #{args}, options: #{options}"
    child = spawn command, args, options
    if child.stdout != null then child.stdout.on 'data', (data) =>
      output += data.toString()
    if child.stderr != null then child.stderr.on 'data', (data) =>
      reject data.toString()

    # child.on 'error', (err) =>
    #   console.log "Debug: " + err
    child.on 'close', (code) =>
      # console.log "Closed command with " + code
      if code == -2 then reject "Unable to find cscope"
      if code != 0 then reject code else resolve output

    if args.detached then child.unref()
  return process

module.exports = Cscope =

  # list of the project directories that have cscope.out files
  dbs: []

  # refresh @dbs
  refresh: ->
    console.log "* in refresh()"
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
    path = @dbs[0]
    mapPromise (runCommand cscopeBinary, ['-dL' + num, keyword], {cwd: path}), fixCscopeResults

  cscope: (keyword, num) ->
    if @dbs.length == 0
      console.log "dbs is empty, refreshing..."
      @refresh()
        .then =>
          console.log "done"
          if @dbs.length == 0
            console.log "it is still empty, giving up"
            Promise.resolve []
          else
            @dbs.forEach (p) -> console.log "- #{p}"
            console.log "it's not empty now, searching..."
            @_cscope2 keyword, num
    else
      console.log "dbs is not empty, searching..."
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
