import { storage } from '../../firebase/firebase';

export const mergeAnnotations = async (docRef, xfdf) => {
  const Core = window.Core;
  const PDFNet = window.PDFNet;
  Core.setWorkerPath('./webviewer/core');

  const storageRef = storage.ref();
  const URL = await storageRef.child(docRef).getDownloadURL();

  const main = async () => {
    const doc = await PDFNet.PDFDoc.createFromURL(URL);
    doc.initSecurityHandler();

    let i;
    for (i = 0; i < xfdf.length; i++) {
      let fdfDoc = await PDFNet.FDFDoc.createFromXFDF(xfdf[i]);
      await doc.fdfMerge(fdfDoc);
      await doc.flattenAnnotations();
    }

    const docbuf = await doc.saveMemoryBuffer(
      PDFNet.SDFDoc.SaveOptions.e_linearized,
    );
    const blob = new Blob([docbuf], {
      type: 'application/pdf',
    });

    const documentRef = storageRef.child(docRef);

    documentRef.put(blob).then(function (snapshot) {
    });
  }

  await PDFNet.runWithCleanup(main);
};
