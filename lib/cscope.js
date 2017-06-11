'use babel';

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

function fixOneLine(line) {

  /* get first three words for the line, and the rest as a fourth element */
  let data = line.split(" ", 3);
  data.push(line.replace(data.join(" ") + " ", ""));

  return {
    fileName: data[0],
    functionName: data[1],
    lineNumber: parseInt(data[2]),
    lineText: data[3]
  }
}

function runCommand(wd, command, args) {

  // console.log(`runCommand: wd: ${wd}, command: ${command}, args: ${args}`)

  return new Promise(

    (resolve, reject) => {

      let output = ''
      let child = spawn(command, args, { cwd: wd })

      child.stdout.on('data', data => output += data.toString())
      child.stderr.on('data', data => reject(new Error(`cscope stderr: ${data.toString()}`)))
      child.on('error', err => reject(err))
      child.on('close', code => code ? reject(new Error(`cscope return value: ${code}`)) : resolve(output))
    }
  )
}

function directoryHasCscopeDatabase(dir) {
  let fullPath = path.join(dir, 'cscope.out');
  return new Promise(
    (resolve, reject) => fs.access(fullPath, fs.R_OK,
                                   err => err? reject(err) : resolve(dir))
  )
}

function cscope(query, keyword) {

  const cscopeBinary = atom.config.get('atom-cscope2.cscopeBinaryLocation');
  let ret = []

  function cscopeForPath(projectPath) {

    function useQueryResult(res) {
      let tmp = res.split('\n')
          .map(e => e.trim())
          .filter(e => e.length > 0)
          .map(fixOneLine)
      tmp.forEach(r => r.projectPath = projectPath)
      ret.push(tmp)
    }

    return directoryHasCscopeDatabase(projectPath)
      .then(p => runCommand(p, cscopeBinary, [`-dL${query}`, keyword]))
      .then(useQueryResult)
      .catch(x => Promise.resolve(null))
  }

  let promises = atom.project.getPaths().map(cscopeForPath)

  return Promise.all(promises).then(
    x => [].concat.apply([], ret)
  )
}

export default cscope
