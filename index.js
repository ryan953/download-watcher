'use strict';

const Detector = require('./Detector');
const Filesystem = require('./Filesystem');
const User = require('./User');

const async = require('async');
const config = require('./config');

const args = Array.prototype.slice.call(process.argv, 2);

function printSection(items, title, predicate, display) {
  console.log('');
  console.log(title);
  const filtered = items
    .filter(predicate);

  filtered.forEach((item) => {
      console.log("\t", display(item));
    });
  if (!filtered.length) {
    console.log('-- no items --');
  }
}

function init() {
  Filesystem.listChildren(config.folders, (fileObjects) => {

    const isTVFilter = (fileObject) => fileObject.type.isTV;
    const notTVFilter = (fileObject) => !fileObject.type.isTV;

    const results = fileObjects
      .map((fileObject) => {
        return {
          path: fileObject.path,
          file: fileObject.file,
          type: Detector.type(fileObject.file),
        };
      });

    printSection(
      results,
      'TV',
      isTVFilter,
      (fileObject) => `${fileObject.file}\t${fileObject.type.destFolder}`
    );

    printSection(
      results,
      'NOT TV',
      notTVFilter,
      (fileObject) => fileObject.file
    );
    console.log('');
    console.log('');

    User.collectDescisions(
      results
    ).then((items) => {
      console.log('');
      const toMove = items
        .filter((fileObject) => {
          if (!fileObject.willMove) {
            console.log('Skipping', fileObject.file);
            return false;
          }
          return true;
        });
      let moveCount = 0;

      if (!toMove.length) {
        console.log('');
        console.log('-- no files to move --');
      } else {
        async.mapSeries(
          toMove,
          (fileObject, callback) => {
            Filesystem.moveFrom(
              fileObject.file,
              fileObject.path,
              fileObject.type.destFolder
            ).then(() => {
              moveCount += 1;
              console.log(`${moveCount}/${toMove.length} done`);
              callback(null, moveCount);
            }, (err) => {
              callback(err, null);
            });
          },
          (err, results) => {
            console.log('');
            console.log('Done all moves');
          }
        );
      }
    });
  });
}

try {
  init();
} catch (e) {
  console.error(e);
}
