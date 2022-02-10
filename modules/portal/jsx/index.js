import {useEffect, useState} from 'react';
import {Html5Qrcode} from "html5-qrcode";
import CSSGrid from 'jsx/CSSGrid';
import swal from 'sweetalert2';

/**
 * The main page
 *
 * @param props {object} - React props
 *
 * @return {ReactDOM}
 */
export function IndexPage(props) {
    const [CandID, setCandID] = useState(false);
    const [VisitLabel, setVisitLabel] = useState(false);
    const [cards, setCards] = useState([]);

    let html5QrCode;
    useEffect(() => {
      if (CandID !== false) {
          return;
      }
      html5QrCode = new Html5Qrcode("qrreader", false);
      html5QrCode.start(
        { facingMode: 'environment'},
        {
          fps: 10,    // Optional, frame per seconds for qr code scanning
          // qrbox: { width: 250, height: 250 }  // Optional, if you want bounded box UI
        },
        (decodedText, decodedResult) => {
            console.log('in QRModal', decodedText, decodedResult);
            // props.onScan(decodedText);
            try {
                const value = JSON.parse(decodedText);
                const PSCID = value.PSCID;
                const VL = value.VisitLabel;
                html5QrCode.stop();

                console.log(PSCID, VL);

                // validate / convert PSCID to CandID
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
                    swal.fire({
                        title: 'Confirmation',
                        icon: 'info',
                        html:
                            '<p>You appear to be here for visit ' + VL +
                            '</p><p>Is this correct?</p>',
                            showCancelButton: true,
                            focusConfirm: false,
                            confirmButtonText: '<i class="fa fa-thumbs-up"></i> Yes',
                            confirmButtonAriaLabel: 'Yes',
                            cancelButtonText: '<i class="fa fa-thumbs-down"></i> No',
                            cancelButtonAriaLabel: 'No'
                    }).then((swalresult) => {
                        if (swalresult.value === true) {
                            swal.fire({
                                title: 'Great!',
                                html: '<p>Press OK to continue to data entry.</p>',
                            });
                            setCandID(result);
                            setVisitLabel(VL);
                        } else {
                            swal.fire({
                                title: 'Incorrect code',
                                icon: 'error',
                                html: '<p>You have an invalid QR code. Please see your study ' +
                                      'coordinator to correct.</p>'
                            });
                            setCandID(false);
                            setVisitLabel(false);
                        }
                    });
                })
            } catch(err) {
                console.error(err);
            }
        },
        (errorMessage) => {
            // parse error, ignore it.
        }).catch(err => {
            console.error(err);
        });
    },
    [CandID]);

    useEffect(async () => {
        if (CandID === false) {
            return;
        }
        let loadCards;

        const loadCandidate = async function() {
            let response = await fetch(props.BaseURL + '/api/v0.0.3/candidates/' + CandID);
            let data = await response.json();
            loadCards = props.loadCardsClosure(
                data,
                {
                    CandID: CandID,
                    VisitLabel: VisitLabel,
                }
            ); 
            console.log('candidate',data);
            return data;
        };

        const loadVisits = async function(candidate) {
            let visits = candidate.Visits.map(async function(visit) {
                let response = await fetch(props.BaseURL + '/api/v0.0.3/candidates/' + candidate.Meta.CandID + '/' + visit);
                let data = await response.json();
                return data;
            });
            console.log('visits', visits);
            return Promise.all(visits);
        };
        console.log(loadCards);
        const visits = await loadCandidate().then(loadVisits);
        const cards = await loadCards(visits);
        setCards(cards);

        console.log('cards', cards);

    },
    [CandID, VisitLabel]);

    if (CandID === false) {
        return <div><h1>Scan QR Code</h1><div id="qrreader">Scan QR Code</div></div>;
    }
    return <CSSGrid Cards={cards} />;
}
