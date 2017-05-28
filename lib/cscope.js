'use babel';

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

let fixOneLine = line => {
  let data = line.split(" ", 3);
  data.push(line.replace(data.join(" ") + " ", ""));
  return {
    fileName: data[0],
    functionName: data[1],
    lineNumber: parseInt(data[2]),
    lineText: data[3]
  }
}

let fixCscopeResults = res =>
  res.split('\n')
    .map((e, i, a) => e.trim())
    .filter((e, i, a) => e.length > 0)
    .map((e, i, a) => fixOneLine(e))

let runCommand = (wd, command, args) =>
  new Promise(

    (resolve, reject) => {
      let output = '';
      // console.log "command: #{command}, args: #{args}, options: #{wd}"
      let child = spawn(command, args, { cwd: wd });
      child.stdout.on('data', data => {
        return output += data.toString();
      });
      child.stderr.on('data', data => {
        return reject(new Error(`cscope stderr: ${data.toString()}`));
      });
      child.on('error', err => {
        return reject(err);
      });
      return child.on('close', code => {
        // console.log "Closed command with " + code
        if (code !== 0) {
          return reject(new Error(`cscope return value: ${code}`));
        } else {
          return resolve(output);
        }
      });
    }

  )

export default {

  // list of the project directories that have cscope.out files
  dbs: [],

  // refresh @dbs
  // FIXME: add to Project::onDidChangePaths(callback)
  refresh() {
    let promises = atom.project.getPaths().map(function(p) {
      let fullPath = path.join(p, 'cscope.out');
      return new Promise(function(resolve, reject) {
        return fs.access(fullPath, fs.R_OK | fs.W_OK, function(err) {
          if (err) {
            return reject(err);
          } else {
            return resolve(p);
          }
        });
      });
    });
    return this._filterPromises(promises)
      .then(ls => this.dbs = ls);
  },

  _cscope2(keyword, num) {
    let cscopeBinary = atom.config.get('atom-cscope2.cscopeBinaryLocation');
    let ret = [];
    let ps = this.dbs.map(projectPath => {
      return runCommand(projectPath, cscopeBinary, [`-dL${num}`, keyword])
        .then(fixCscopeResults)
        .then(results => {
          results.forEach(res => res.projectPath = projectPath);
          return results;
      });
    });
    return Promise.all(ps)
      .then(psr => {
        return [].concat.apply([], psr);
    });
  },

  cscope(keyword, num) {
    if (this.dbs.length === 0) {
      return this.refresh()
        .then(() => {
          if (this.dbs.length === 0) {
            return Promise.resolve([]);
          } else {
            this.dbs.forEach(p => console.log(`- ${p}`));
            return this._cscope2(keyword, num);
          }
      });
    } else {
      return this._cscope2(keyword, num);
    }
  },

  // The argument is an array of promises
  // The function returns an array of results of all resolved promises
  _filterPromises(promiseArray) {
    let ret = [];
    promiseArray.forEach(p => p.then(function(v) {
        ret.push(v);
        return Promise.resolve(null);
    })
     );
    err => Promise.resolve(null);
    return Promise.all(promiseArray).then(() => {
      return ret;
    });
  }
}
