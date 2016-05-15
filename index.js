const Filesystem = require('./Filesystem');
const Detector = require('./Detector');

const FOLDERS = [
  '/Volumes/Parkdale/Video/Dropbox-TV',
  '/Users/ryan/Movies/Downloaded',
];

Filesystem.listChildren(FOLDERS, (fileObjects) => {

  fileObjects
    .map((fileObject) => {
      return {
        path: fileObject.path,
        file: fileObject.file,
        type: Detector.type(fileObjects.file),
      };
    })
    .forEach((fileObject) =>
      console.log(fileObject.file, fileObject.type)
    );
});
