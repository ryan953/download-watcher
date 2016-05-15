'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp')

function moveFrom(file, source, dest, fn) {
  const oldPath = `${source}/${file}`;
  const newPath = `${dest}/${file}`;

  console.log('Starting to move', file);
  console.log('from', "\t", oldPath);
  console.log('to', "\t", newPath);

  mkdirp.sync(dest);

  return new Promise((fullfill, reject) => {
    fn(oldPath, newPath, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Done moving', file);
        fullfill();
      }
    });
  });
}

module.exports = {
  listChildren: function(paths, callback) {
    const promises = paths.map((path) =>
      new Promise((fullfill, reject) =>
        fs.readdir(path, (err, files) => {
          if (err) {
            reject(err);
          } else {
            fullfill(
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
    const fn = fs.rename.bind(fs);
    return moveFrom(file, source, dest, fn);
  },

  testMoveFrom(file, source, dest) {
    const fn = (_1, _2, callback) => {
      setTimeout(() => callback(null), 100);
    };
    return moveFrom(file, source, dest, fn);
  },

};
