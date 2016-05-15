const fs = require('fs');

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

};
