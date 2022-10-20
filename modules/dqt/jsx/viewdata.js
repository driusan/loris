import swal from 'sweetalert2';
import {useState, useEffect} from 'react';

import fetchDataStream from 'jslib/fetchDataStream';

import StaticDataTable from 'jsx/StaticDataTable';

/**
 * The View Data tab
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function ViewData(props) {
    const [resultData, setResultData] = useState([]);
    const [loading, setLoading] = useState(null);
    useEffect(() => {
        setLoading(true);
        const payload = calcPayload(props.fields, props.filters);
        if (payload == {}) {
            return;
        }
        props.onRun(); // forces query list to be reloaded
        fetch(
           loris.BaseURL + '/dqt/queries',
           {
             method: 'POST',
             credentials: 'same-origin',
             body: JSON.stringify(payload),
           },
        ).then(
           (resp) => {
               if (!resp.ok) {
                   throw new Error('Error creating query.');
               }
               return resp.json();
           }
        ).then(
            (data) => {
                let resultbuffer = [];
                const response = fetchDataStream(
                    loris.BaseURL + '/dqt/queries/' + data.QueryID + '/run',
                    (row) => {
                        resultbuffer.push(row);
                    },
                    () => {
                        if (resultbuffer.length % 1000 == 0) {
                            setResultData([...resultbuffer]);
                        }
                    },
                    () => {
                        setResultData([...resultbuffer]);
                        setLoading(false);
                    },
                );
                props.onRun(); // forces query list to be reloaded
                if (response && !response.ok) {
                    response.then(
                        (resp) => resp.json()
                    ).then(
                        (data) => {
                            swal.fire({
                                type: 'error',
                                text: data.error,
                            });
                        }
                    );
                }
            }
        ).catch(
            (msg) => {
                swal.fire({
                    type: 'error',
                    text: msg,
                });
            }
        );
    }, [props.fields, props.filters]);
    const queryTable = loading ? (
        <div>
            <h2>Query not yet run</h2>
        </div>
        ) : (
        <StaticDataTable
            Headers={props.fields.map((val) => {
                return val.field;
            })}
            RowNumLabel='Row Number'
            Data={resultData}
            />
        );
    return <div>
         <h2>This page is under construction</h2>
          {queryTable}
    </div>;
}

/**
 * Calculates the payload to submit to the search endpoint
 * to run the query.
 *
 * @param {array} fields - the fields to query
 * @param {QueryGroup} filters - the root of the filters
 *
 * @return {object}
 */
function calcPayload(fields, filters) {
    let payload = {
        type: 'candidates',
        fields: fields.map((val) => {
            return {
                module: val.module,
                category: val.category,
                field: val.field,
            };
        },
        ),
    };
    if (filters.group.length > 0) {
        payload.criteria = filters;
    }
    return payload;
}

export default ViewData;
