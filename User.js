'use strict';

const async = require('async');
const prompt = require('prompt');

const ACCEPT_PROMPT = {
  name: 'accept',
  description: 'Yes/No?',  // Prompt displayed to the user. If not supplied name will be used.
  type: 'string',                      // Specify the type of input to expect.
  pattern: /^(yes|no|quit|y|n|q)$/i,
  message: 'Must type either Y, N, YES or NO. Quit to exit', // Warning message to display if validation fails.
  hidden: false,                       // If true, characters entered will either not be output to console or will be outputed using the `replace` string.
  default: 'n',             // Default value to use if no value is entered.
  required: true,
  before: (value) => {
    return {'y': true, 'f': false, 'q': 'quit'}[value.toLowerCase()[0]] || false;
  },
};

prompt.start();

function askForAccept(source, dest) {
  return new Promise((fullfill, reject) => {
    prompt.get([ACCEPT_PROMPT], (err, result) => {
      if (err) {
        reject(err);
      } else {
        if (result.accept === 'quit') {
          console.log('Exiting.');
          process.exit(0);
        }
        fullfill(result.accept);
      }
    });
  });
}

module.exports = {

  collectDescisions: function(fileObjects) {
    return new Promise((fullfill, reject) => {
      async.mapSeries(
        fileObjects,
        (fileObject, callback) => {
          console.log('');
          console.log('Move', fileObject.file);
          console.log('from', "\t", fileObject.path);
          console.log('to', "\t", fileObject.type.destFolder);

          askForAccept()
            .then((accepted) => {
              fileObject.willMove = accepted;
              callback(null, fileObject);
            }, (err) => {
              callback(err, null);
            });
        },
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            fullfill(results);
          }
        }
      );
    });
  },

};
