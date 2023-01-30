const fs = require('fs-extra');

const copyFiles = async () => {
  try {
    await fs.copy('./node_modules/@pdftron/webviewer/public', './public/webviewer');
  } catch (err) {
    console.error("WebViewer files err",err);
  }
};

copyFiles();