import React, { useEffect } from 'react';
import Modal from 'jsx/Modal';

import {Html5Qrcode} from "html5-qrcode"


/**
 * Widget to access a profile using a QR code
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function QRModal(props) {
    let html5QrCode;
    useEffect(() => {
        html5QrCode = new Html5Qrcode("reader", false);
        html5QrCode.start(
          { facingMode: 'environment'}, 
          {
              fps: 10,    // Optional, frame per seconds for qr code scanning
              qrbox: { width: 250, height: 250 }  // Optional, if you want bounded box UI
          },
          (decodedText, decodedResult) => {
              console.log('in QRModal', decodedText, decodedResult);
              props.onScan(decodedText);
              html5QrCode.stop();
          },
          (errorMessage) => {
              // parse error, ignore it.
          }
        ).catch(err => {
            console.error(err);
        });
    });

    const onClose = () => {
        if (html5QrCode) {
            html5QrCode.stop();
        }
        props.onClose();
    }

    return <Modal onClose={onClose} show={true} title='Scan QR Code'>
        <div id="reader" width="600px"></div>
    </Modal>
}

export default QRModal;
