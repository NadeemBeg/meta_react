import React, { useEffect, useState } from "react";
import { Button, Table, Text, Spinner } from "gestalt";
import "gestalt/dist/gestalt.css";
import { searchForDocumentToSign } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
const SignList = () => {
  const { email } = JSON.parse(localStorage.getItem('chat-app-current-user'));

  const [docs, setDocs] = useState([]);
  const [show, setShow] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function getDocs() {
      const docsToSign = await searchForDocumentToSign(email);
      docsToSign.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return (b.requestedTime) - (a.requestedTime);
      });
      setDocs(docsToSign);
      setShow(false);
    }

    setTimeout(getDocs, 1000);
  }, [email]);

  return (
    <div>
      {show ? (
        <Spinner show={show} accessibilityLabel="spinner" />
      ) : (
        <div>
          {docs.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>                    
                      From                    
                  </th>
                  <th>                    
                      When                    
                  </th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.docRef}>
                    <td className="email">
                      <Text color="white">{doc.email}</Text>
                    </td>
                    <td className="time">
                      
                        {doc.requestedTime
                          ? new Date(
                            doc.requestedTime.seconds * 1000
                          ).toDateString() +
                          "   " +
                          (new Date(
                            doc.requestedTime.seconds * 1000
                          ).getHours() %
                            12) +
                          ":" +
                          new Date(
                            doc.requestedTime.seconds * 1000
                          ).getMinutes()
                          : ""}
                      
                    </td>
                    <td className="btn">
                      <button className="doc-btn"
                        onClick={(event) => {
                          localStorage.setItem('SIGN_DOC', JSON.stringify(doc));
                          navigate(`/signDocument`);
                        }}                        
                      >Sign</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            "You do not have any documents to sign"
          )}
        </div>
      )}
    </div>
  );
};

export default SignList;
