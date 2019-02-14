const path = require('path');
const fs = require('fs');
const appPath = require('./path');

const deleteFile = (filePath) => {
  fs.unlink(path.join(appPath, filePath), (err) => {
    if (err) {
      console.log(err)
      throw err;
    }
  })
}

exports.deleteFile = deleteFile;