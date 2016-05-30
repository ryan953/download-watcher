'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp')
const path = require('path');
const spawn = require('child_process').spawn;

/**
 * Simple object extend function
 * @param  { object } obj1 reciver
 * @param  { object } obj2
 */
function extend(obj1, obj2) {
  for (var i in obj2) {
    if (obj2.hasOwnProperty(i)) {
      obj1[i] = obj2[i];
    }
  }
  return obj1;
}

function moveFrom(file, source, dest, fn) {
  const oldPath = `${source}/${file}`;
  const newPath = dest;

  console.log('Starting to move', file);
  console.log('from', "\t", oldPath);
  console.log('to', "\t", newPath);

  mkdirp.sync(dest);

  return new Promise((resolve, reject) => {
    fn(oldPath, newPath, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Done moving', file);
        resolve();
      }
    });
  });
}

const Filesystem = {
  listChildren: function(paths, callback) {
    const promises = paths.map((path) =>
      new Promise((resolve, reject) =>
        fs.readdir(path, (err, files) => {
          if (err) {
            reject(err);
          } else {
            resolve(
              files
                .filter((file) =>
                  file !== '.DS_Store'
                )
                .map((file) => {
                  return {path, file};
                })
            );
          }
        })
      )
    );

    Promise
      .all(promises)
      .then((arraysOfFiles) =>
        callback([].concat.apply([], arraysOfFiles))
      );
  },

  moveFrom(file, source, dest) {
    const fn = (oldPath, newPath, callback) => {
      const pro = Filesystem.exec(
        'rsync',
        [
          '--compress',
          '--dirs',
          '--human-readable',
          '--progress',
          '--recursive',
          '--verbose',
          '--itemize-changes',
          '--remove-source-files',
          oldPath,
          newPath
        ],
        {}
      ).then(
        () => {
          callback(null);
        },
        (err) => callback(err)
      );
    };
    return moveFrom(file, source, dest, fn);
  },

  exec(command, args, envVariables) {
    try {
      return new Promise((resolve, reject) => {
        const env = extend(extend({}, process.env), envVariables);

        console.log(`Executing: ${command} ${args.join(' ').trim()}`);

        args = args.filter((arg) => !!arg);
        var cmd = spawn(path.normalize(command), args, {
          cwd: process.cwd(),
          env: env,
          stdio: 'inherit',
        });

        cmd.on('exit', (code) => {
          if(code === 1) {
            reject();
          } else {
            resolve();
          }
        });
      }).catch((err) => {
        console.log('Promise failed starting up', err);
      });
    } catch (e) {
      console.error('error', e);
    }
  },

};

module.exports = Filesystem;
