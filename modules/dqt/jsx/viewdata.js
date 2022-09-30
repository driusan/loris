import fetchDataStreamPost from 'jslib/fetchDataStreamPost';
import swal from 'sweetalert2';
import {useState, useEffect} from 'react';
import 'jsx/StaticDataTable';
/**
 * The View Data tab
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function ViewData(props) {
    const [resultData, setResultData] = useState(false);
    const [loading, setLoading] = useState(null);
    useEffect(() => {
        setLoading(true);
        const payload = calcPayload(props.fields, props.filters);
        if (payload == {}) {
            return;
        }
        let resultbuffer = [];
        props.onRun();
        const response = fetchDataStreamPost(loris.BaseURL + '/dqt/search',
            payload,
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
        if (response && !response.ok) {
            console.log('resp', response);
            response.then(
                (resp) => resp.json()
            ).then(
                (data) => {
                    const msg = data.error || 'Error running query.';
                    swal.fire({
                        type: 'error',
                        text: msg,
                    });
                }
            );
        }
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
