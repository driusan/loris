import React, { useState, useEffect } from 'react';
import QRModal from 'jsx/QRModal';

import {Html5Qrcode} from "html5-qrcode"

/**
 * Widget to access a LORIS candidate profile 
 * and start a data entry workflow.
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function AccessWidget(props) {
    let widgets = [];
    if (props.AccessWidget) {
        widgets.push(<SimpleAccessWidget key="textaccess" BaseURL={props.BaseURL} IncludeQR={props.QRWidget} />);
    }
    if (props.QRWidget) {
        widgets.push(<QRAccessWidget key="qraccess" BaseURL={props.BaseURL} />);
    }
    return <div>{widgets}</div>;
}

/**
 * Widget to access a profile using a QR code
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function QRAccessWidget(props) {
    const scan = (e) => {
        window.location.assign(props.BaseURL + '/portal/');
    }

    return <div>
                <button onClick={scan} type="submit" className="btn btn-primary">Begin Participant Workflow</button>
           </div>
}

/**
 * Widget to access a profile using a form
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function SimpleAccessWidget(props) {
    const [toValidate, setToValidate] = useState(false);
    const [error, setError] = useState('');
    const [scanClicked, setScanClicked] = useState(false);
    const [PSCID, setPSCID] = useState(false);
    const [CandID, setCandID] = useState(false);

    // Validate data entry if applicable
    useEffect(
        () => {
            if (toValidate === false) {
                return;
            }
            console.log('validate', toValidate);
            fetch(props.BaseURL + '/candidate_list/validateids?' 
                + 'CandID=' + toValidate.CandID
                + '&PSCID=' + toValidate.PSCID,
                {
                      credentials: 'same-origin'
                })
            .then((result) => result.text())
            .then((result) => {
                if (result === "0") {
                    setError('Invalid candidate');
                    return;
                }
                console.log('validate result', result);
                window.location = props.BaseURL + '/candidate_profile/' + toValidate.CandID;
            });
        },
        [toValidate],
    );

    // Validate QR Code if applicable
    useEffect(
        () => {
            if (CandID) {
                fetch(props.BaseURL + '/candidate_list/validateids?CandID=' + CandID,
                    {
                          credentials: 'same-origin',
                    })
                .then((result) => result.text())
                .then((result) => {
                    if (result === "1") {
                        window.location = props.BaseURL + '/candidate_profile/' + CandID;
                        return;
                    }
                    setError('Invalid candidate');
                    setCandID(false);
                });
            } else if (PSCID) {
                fetch(props.BaseURL + '/candidate_list/convertID?PSCID=' + PSCID,
                    {
                          credentials: 'same-origin',
                    })
                .then((result) => {
                    if (!result.ok) {
                        throw new Error("Could not convert ID");
                    }
                    return result.text();
                }).then((result) => {
                    // Just set the candID, in order to trigger the CandID validation
                    // logic.
                    setCandID(result);
                })
                .catch((err) => {
                    console.error(err);
                });

            }
        },
        [PSCID, CandID],
    );

    const validateInput = (e) => {
        e.preventDefault();
        setToValidate({
            'CandID' : e.target[0].value,
            'PSCID' : e.target[1].value,
        });
    }

    const readQR = (e) => {
        setScanClicked(true);
        e.preventDefault();
    };

    const scannerValue = (text) => {
        console.log('in scanner value');
        console.log(text);
        try {
            console.log('parsing');
            const obj = JSON.parse(text); 
            console.log('parsed');
            console.log(obj);
            if (obj.CandID) {
                console.log('set CandID', obj.CandID);
                setCandID(obj.CandID);
            } else if (obj.PSCID) {
                console.log('set PSCID', obj.PSCID);
                setPSCID(obj.PSCID);
            }
        } catch(err) {
            console.error(err);
            return;
        }
        console.log('out scanner value');
    };

    const errorDiv = error == '' ? null : <div className='error'>{error}</div>;
    return <div>
            {scanClicked ? <QRModal onClose={() => setScanClicked(false)} onScan={scannerValue}/> : null}
    <form onSubmit={validateInput}>
      <div className="form-group">
          <label htmlFor="candidinput">CandID</label>
          <input type="text" className="form-control" id="candidinput" placeholder="Enter CandID" />
      </div>
      <div className="form-group">
          <label htmlFor="pscidinput">PSCID</label>
          <input type="text" className="form-control" id="pscidinput" placeholder="Enter PSCID" />
      </div>
      {errorDiv}
      <div style={{display: 'flex'}}>
          <button type="submit" className="btn btn-primary">Access Candidate Profile</button>
          <button onClick={readQR} className="btn btn-primary">Access via QR Code</button>
      </div>
      </form>
    </div>;
}

export default AccessWidget;
