import React, { useRef, useEffect, useState } from 'react';
import { storage } from '../../firebase/firebase';
import WebViewer from '@pdftron/webviewer';
import 'gestalt/dist/gestalt.css';
import './ViewDocument.css';
import { useNavigate } from "react-router-dom";
import back from "../../assets/back.svg";
import LoadingGIF from '../../assets/download-gif.gif';
const ViewDocument = () => {
  const [instance, setInstance] = useState(null);
  const [loader, setLoder]= useState(true);

  let docs = JSON.parse(localStorage.getItem('docs'));

  const viewer = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    WebViewer(
      {
        path: 'webviewer',
        disabledElements: [
          'ribbons',
          'toggleNotesButton',
          'contextMenuPopup',
        ],
      },
      viewer.current,
    ).then(async instance => {
      // alert()
      // select only the view group
      instance.UI.setToolbarGroup('toolbarGroup-View');

      setInstance(instance);

      // load document
      const storageRef = storage.ref();
      const URL = await storageRef.child(docs.docRef).getDownloadURL();
      instance.Core.documentViewer.loadDocument(URL).then((res)=>{
        console.log("resres",res);
        setLoder(false);
        console.log("setLoder",loader);
      }).catch((err)=>{
        console.log("errerrerr",err);
      })
    });
  }, [docs.docRef,loader]);

  const download = () => {
    instance.UI.downloadPdf(true);
  };

  const doneViewing = async () => {
    navigate('/');
  }
  
  const certificate = async () => {
    window.open('/my-document', '_blank', 'noreferrer');
    // navigate('/my-document');
  }

  const viewDocument = {
    color: "#fff",
    fontSize: "24px",
    padding: "20px",
    fontWeight: "bold",
  };

  return (
    <div className={'prepareDocument'}>
      <div className="back-btn">
        <a href="" className={"back docs-btn"} onClick={() => { navigate(`/`) }}> 
          <img src={back} /><span>Back</span>
        </a>
      </div>
      <span style={viewDocument}>View Document</span>
      { loader ? <img className="down-loader" style={{"display":"block","marginLeft":"auto","marginRight":"auto"}} src={LoadingGIF} /> :
      <div className={'btn-action'}>
        <button className={'btn-docs'} id="downloadDocs" onClick={download}>
          Download
        </button>
        <button className={'btn-docs'} onClick={doneViewing}>
          Done Viewing
        </button>
        <button className={'btn-docs'} onClick={certificate}>
          View Certificate
        </button>
      </div>
      }
      <div className="webviewer" ref={viewer}></div>
      {/* <Box display="flex" direction="row" flex="grow">
        <Row>
          <Box padding={3}>
            <Heading size="md"><span style={viewDocument}>View Document</span></Heading>
          </Box>
          <Box padding={3}>
            <Row gap={1}>
              <Stack>
                <Box padding={2}>
                  <Button
                    onClick={download}
                    accessibilityLabel="download signed document"
                    text="Download"
                    iconEnd="download"
                  />
                </Box>
                <Box padding={2}>
                  <Button
                    onClick={doneViewing}
                    accessibilityLabel="complete signing"
                    text="Done viewing"
                    iconEnd="check"
                  />
                </Box>
                <Box padding={2}>
                  <Button
                    onClick={certificate}
                    accessibilityLabel="complete signing"
                    text="View Certificate"
                  />
                </Box>
              </Stack>
            </Row>
          </Box>
        </Row>
        <Row>
          <div className="webviewer" ref={viewer}></div>
        </Row>
      </Box> */}
    </div>
  );
};

export default ViewDocument;
