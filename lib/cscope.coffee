spawn = require('child_process').spawn

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

  cscope: (keyword, num) ->

    console.log "* projects:"
    atom.project.getPaths().forEach (p) -> console.log "* #{p}"

    path = atom.project.getPaths()[0]
    # console.log "path: #{path}"
    cscopeBinary = atom.config.get('atom-select-list-test.cscopeBinaryLocation')
    mapPromise (runCommand cscopeBinary, ['-dL' + num, keyword], {cwd: path}), fixCscopeResults
