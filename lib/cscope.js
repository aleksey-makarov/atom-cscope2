'use babel';

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// list of the project directories that have cscope.out files
let dbs = []

function fixOneLine(line) {
  let data = line.split(" ", 3);
  data.push(line.replace(data.join(" ") + " ", ""));
  return {
    fileName: data[0],
    functionName: data[1],
    lineNumber: parseInt(data[2]),
    lineText: data[3]
  }
}

function fixCscopeResults(res) {
  return res.split('\n')
    .map((e, i, a) => e.trim())
    .filter((e, i, a) => e.length > 0)
    .map((e, i, a) => fixOneLine(e))
}

function runCommand(wd, command, args) {

  // console.log "command: #{command}, args: #{args}, wd: #{wd}"

  return new Promise(

    (resolve, reject) => {

      let output = '';
      let child = spawn(command, args, { cwd: wd });

      child.stdout.on('data', data => output += data.toString())
      child.stderr.on('data', data => reject(new Error(`cscope stderr: ${data.toString()}`)))
      child.on('error', err => reject(err))
      child.on('close', code => code ? reject(new Error(`cscope return value: ${code}`)) : resolve(output) )

    }
  )
}

// The argument is an array of promises
// The function returns an array of results of all resolved promises
function filterPromises(a) {

  let ret = [];

  a2 = a.map(
    p => p.then(
      v => {
        ret.push(v)
        return Promise.resolve(null)
      },
      err => Promise.resolve(null)
    )
  );

  return Promise.all(a2).then(() => ret);
}

// refresh @dbs
// FIXME: add to Project::onDidChangePaths(callback)
function refresh() {

  let promises = atom.project.getPaths().map(
    p => {
      let fullPath = path.join(p, 'cscope.out');
      return new Promise(
        (resolve, reject) =>
          fs.access(fullPath, fs.R_OK | fs.W_OK, err => err ? reject(err) : resolve(p))
      )
    }
  )
  return filterPromises(promises).then(ls => dbs = ls);
}

function cscope2(query, keyword) {

  const cscopeBinary = atom.config.get('atom-cscope2.cscopeBinaryLocation');

  let ret = [];

  let ps = dbs.map(
    projectPath => {
      return runCommand(projectPath, cscopeBinary, [`-dL${query}`, keyword])
        .then(fixCscopeResults)
        .then(
          results => {
            results.forEach(res => res.projectPath = projectPath);
            return results;
          }
        )
    }
  );

  return Promise.all(ps).then(psr => [].concat.apply([], psr))
}

function cscope(query, keyword) {
  if (!dbs.length)
    return refresh().then(() => cscope2(query, keyword))
  else
    return cscope2(query, keyword)
}

export default {
  cscope,
  refresh
}
