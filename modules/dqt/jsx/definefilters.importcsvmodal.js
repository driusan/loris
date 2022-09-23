import Modal from 'jsx/Modal';
import {useState} from 'react';
import Papa from 'papaparse';
import swal from 'sweetalert2';

/**
 * Render a modal window for adding a filter
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function ImportCSVModal(props) {
    const [csvFile, setCSVFile] = useState(null);
    const [csvHeader, setCSVHeader] = useState(true);
    const [csvType, setCSVType] = useState('session');
    const [idType, setIdType] = useState('PSCID');
    const submitPromise = () =>
        new Promise((resolve, reject) => {
           resolve();
        }
    );

    const candIDRegex = new RegExp('^[1-9][0-9]{5}$');

    const csvParsed = (value) => {
        // setCSVData(value.data);
        if (value.errors && value.errors.length > 0) {
            console.error(value.errors);
            swal.fire({
                icon: 'error',
                title: 'Invalid CSV',
                text: 'Could not parse CSV file',
            });
        }

        // If candidates: validate 1 column
        // If sessions: validate 2 columns
        const expectedLength = (csvType === 'session' ? 2 : 1);
        for (let i = 0; i < value.data.length; i++) {
            if (value.data[i].length != expectedLength) {
                swal.fire({
                    icon: 'error',
                    title: 'Invalid CSV',
                    text: 'Expected ' + expectedLength + ' columns in CSV.'
                        + ' Got ' + value.data[i].length + ' on line ' +
                        (i+1) + '.',
                });
                return;
            };
            if (idType === 'CandID') {
                if (candIDRegex.test(value.data[i][0]) !== true) {
                    console.log(
                        'invalid value',
                        candIDRegex.test(value.data[i][0]),
                        value.data[i][0]
                    );
                    swal.fire({
                        icon: 'error',
                        title: 'Invalid DCC ID',
                        text: 'Invalid DCC ID (' + value.data[i][0]
                            + ') on line '
                            + (i+1) + '.',
                    });
                }
            }
        }
    };

    const dtstyle = {
        marginLeft: '1em',
        marginTop: '1em',
    };

    return <Modal title="Import Population From CSV"
       show={true}
       throwWarning={true}
       onClose={props.closeModal}
       onSubmit={submitPromise}>
            <div>
            <form>
                <fieldset>
                    <div>
                        <dl>
                            <dt style={dtstyle}>CSV containing list of</dt>
                            <dd>
                                <input type="radio" name="csvtype"
                                   checked={csvType == 'candidate'}
                                   onChange={() => setCSVType('candidate')}
                               /> Candidates
                                <input type="radio" name="csvtype"
                                   style={{marginLeft: '1.5em'}}
                                   checked={csvType == 'session'}
                                   onChange={() => setCSVType('session')}
                                /> Sessions
                                </dd>
                            <dt style={dtstyle}>Candidate identifier type</dt>
                            <dd><input type="radio" name="candidtype"
                                   checked={idType == 'CandID'}
                                   onChange={() => setIdType('CandID')}
                                /> DCC ID
                                <input type="radio" name="candidtype"
                                   style={{marginLeft: '1.5em'}}
                                   checked={idType == 'PSCID'}
                                   onChange={() => setIdType('PSCID')}
                                /> PSCID
                            </dd>
                            <dt style={dtstyle}>
                                Does CSV contain a header line?
                            </dt>
                            <dd><input type="radio" name="header"
                                   checked={csvHeader == true}
                                   onChange={() => setCSVHeader(true)}
                                /> Yes
                                <input type="radio" name="header"
                                   style={{marginLeft: '1.5em'}}
                                   checked={csvHeader == false}
                                   onChange={() => setCSVHeader(false)}
                                /> No
                            </dd>
                            <dt style={dtstyle}>CSV File</dt>
                            <dd><FileElement label='' name="csvfile"
                                value={csvFile}
                                onUserInput={(filename, file) => {
                                    setCSVFile(file);
                                    let papaparseConfig = {
                                        skipEmptyLines: true,
                                        header: csvHeader,
                                        complete: csvParsed,
                                    };
                                    // Only 1 column, papaparse can't detect
                                    // the delimiter if it's not explicitly
                                    // specified.
                                    if (csvType == 'candidate') {
                                        papaparseConfig.delimiter = ',';
                                    }
                                    Papa.parse(file, papaparseConfig);
                                }}
                            /></dd>
                        </dl>
                    </div>
                </fieldset>
            </form>
        </div>
    </Modal>;
}


export default ImportCSVModal;
