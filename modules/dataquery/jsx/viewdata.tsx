import swal from 'sweetalert2';
import {useState, useEffect, ReactNode} from 'react';

import fetchDataStream from 'jslib/fetchDataStream';

import StaticDataTable from 'jsx/StaticDataTable';
import {SelectElement} from 'jsx/Form';
import {APIQueryField, APIQueryObject} from './types';
import {QueryGroup} from './querydef';
import {FullDictionary, FieldDictionary} from './types';
import {calcPayload} from './calcpayload';

type TableRow = (string|null)[];

type JSONString = string;

type SessionRowCell = {
    VisitLabel: string;
    value?: string
    values?: string[]
};

type KeyedValue = {
    value: string;
    key: string;
}

/**
 * Renders a single table cell value, converting from JSON string to
 * normal string if necessary.
 *
 * @param {object} props - React props
 * @param {string} props.data - The JSON string to display
 * @returns {React.ReactElement} - the Table Cell
 */
function TableCell(props: {data: string}) {
    try {
        const parsed = JSON.parse(props.data);
        if (typeof parsed === 'object') {
            // Can't include objects as react children, if we got here
            // there's probably a bug.
            return <td>{props.data}</td>;
        }
        return <td>{parsed}</td>;
    } catch (e) {
        // Was not valid JSON, so display it as a string
        return <td>{props.data}</td>;
    }
}

/**
 * Display a progress bar.
 *
 * @param {object} props - React props
 * @param {string} props.type - the type of progress being displayed
 * @param {number} props.value - The current value
 * @param {number} props.max - The maximum value
 * @returns {React.ReactElement} - The ProgressBar element
 */
function ProgressBar(props: {type: string, value: number, max: number}) {
    switch (props.type) {
    case 'loading':
        if (props.value == 0) {
            return <h2>Query not yet run</h2>;
        }
        return (<div>
                <label htmlFor="loadingprogress">Loading data:</label>
                <progress id="loadingprogress"
                    value={props.value} max={props.max}>
                    {props.value} of {props.max} candidates
                </progress>
        </div>);
    case 'headers':
        return (<div>
                <label htmlFor="loadingprogress">Organizing headers:</label>
                <progress id="loadingprogress"
                    value={props.value} max={props.max}>
                    {props.value} of {props.max} columns
                </progress>
        </div>);
    case 'dataorganization':
        return (<div>
                <label htmlFor="loadingprogress">Organizing data:</label>
                <progress id="loadingprogress"
                    value={props.value} max={props.max}>
                    {props.value} of {props.max} columns
                </progress>
        </div>);
    }
    return <h2>Invalid progress type: {props.type}</h2>;
}

type RunQueryType = {
  loading: boolean,
  data: string[][],
  totalcount: number,
};
/**
 * React hook to run a given query.
 *
 * @param {APIQueryField[]} fields - The fields selected
 * @param {QueryGroup} filters - The filters selected
 * @param {function} onRun - Callback to call when the query is run
 * @returns {RunQueryType} - a description of the status of the loading and the loaded values
 */
function useRunQuery(
    fields: APIQueryField[],
    filters: QueryGroup,
    onRun: () => void
): RunQueryType {
    const [expectedResults, setExpectedResults] = useState<number>(0);
    const [resultData, setResultData] = useState<string[][]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        const payload: APIQueryObject = calcPayload(fields, filters);
        fetch(
           '/dataquery/queries',
           {
             method: 'post',
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
                const resultbuffer: any[] = [];
                fetch(
                        '/dataquery/queries/'
                            + data.QueryID + '/count',
                        {
                            method: 'GET',
                            credentials: 'same-origin',
                        }
                ).then((resp) => resp.json()
                ).then( (json) => {
                    setExpectedResults(json.count);
                });
                fetchDataStream(
                    '/dataquery/queries/' + data.QueryID + '/run',
                    (row: any) => {
                        resultbuffer.push(row);
                    },
                    () => {
                        if (resultbuffer.length % 10 == 0) {
                            setResultData([...resultbuffer]);
                        }
                    },
                    () => {
                        setResultData([...resultbuffer]);
                        setLoading(false);
                    },
                    'post',
                );
                onRun(); // forces query list to be reloaded

                /*
                if (!response.ok) {
                    response.then(
                        (resp: Response) => resp.json()
                    ).then(
                        (data: {error: string} ) => {
                            swal.fire({
                                type: 'error',
                                text: data.error,
                            });
                        }
                    ); // .catch( () => {});
                }
                */
            }
        ).catch(
            (msg) => {
                swal.fire({
                    type: 'error',
                    text: msg,
                });
            }
        );
    }, [fields, filters]);
    return {
        loading: loading,
        data: resultData,
        totalcount: expectedResults,
    };
}

type DataOrganizationType = {
    headers: string[],
    data: TableRow[],
    status: 'headers'|'data'|'done'|null,
    progress: number,
    }
/**
 * Hook to re-organize tabulated data returned from the API into the format selected by the user
 *
 * @param {RunQueryType} queryData - The data returned by the API
 * @param {string} visitOrganization - The type of data organization selected by the user
 * @param {APIQueryField[]} fields - The fields that need to be organized
 * @param {FullDictionary} fulldictionary - The full dictionary of all selected modules
 * @returns {object} - the headers and data re-organised according to the user's selection
 */
function useDataOrganization(
    queryData: RunQueryType,
    visitOrganization: VisitOrgType,
    fields: APIQueryField[],
    fulldictionary: FullDictionary
) : DataOrganizationType {
    const [tableData, setTableData] = useState<TableRow[]>([]);
    const [orgStatus, setOrgStatus]
        = useState<'headers'|'data'|'done'|null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [headers, setHeaders] = useState<string[]>([]);
    useEffect( () => {
        // console.log('Starting headers effect');
        if (queryData.loading == true) {
            // console.log('Aborting, not finished loading');
            return;
        }
        setOrgStatus('headers');
        organizeHeaders(fields,
          visitOrganization,
          fulldictionary,
          (i) => setProgress(i),
        ).then( (headers: string[]) => {
            setHeaders(headers);
            setOrgStatus('data');

            organizeData(
                queryData.data,
                visitOrganization,
                fulldictionary,
                fields,
                (i) => setProgress(i),
            ).then((data: TableRow[]) => {
                setTableData(data);
                // console.log('organizing. Done');
                setOrgStatus('done');
                });
            });
    }, [visitOrganization, queryData.loading, queryData.data]);
    return {
       'headers': headers,
       'data': tableData,

       'status': orgStatus,
       'progress': progress,
    };
}

/**
 * The View Data tab
 *
 * @param {object} props - React props
 * @param {APIQueryField[]} props.fields - The selected fields
 * @param {QueryGroup} props.filters - The selected filters
 * @param {object} props.fulldictionary - the data dictionary
 * @param {function} props.onRun - Callback for when the query is run
 * @returns {React.ReactElement} - The ViewData tab
 */
function ViewData(props: {
    fields: APIQueryField[],
    filters: QueryGroup,
    onRun: () => void
    fulldictionary: FullDictionary,
}) {
    const [visitOrganization, setVisitOrganization]
        = useState<VisitOrgType>('raw');
    const queryData = useRunQuery(props.fields, props.filters, props.onRun);
    const organizedData = useDataOrganization(
        queryData,
        visitOrganization,
        props.fields,
        props.fulldictionary
    );

    let queryTable;
    if (queryData.loading) {
        queryTable = <ProgressBar
            type='loading'
            value={queryData.data.length}
            max={queryData.totalcount} />;
    } else {
        switch (organizedData['status']) {
        case null:
            return queryTable = <h2>Query not yet run</h2>;
        case 'headers':
            queryTable = <ProgressBar
                type='headers'
                value={organizedData.progress}
                max={props.fields.length} />;
            break;
        case 'data':
            queryTable = <ProgressBar
                type='dataorganization'
                value={organizedData.progress}
                max={queryData.data.length} />;
            break;
        case 'done':
            queryTable = <StaticDataTable
                Headers={organizedData.headers}
                RowNumLabel='Row Number'
                Data={organizedData.data}
                getFormattedCell={
                     organizedFormatter(
                        queryData.data,
                        visitOrganization,
                        props.fields,
                        props.fulldictionary,
                    )
                }
                />;
            break;
        default:
            throw new Error('Unhandled organization status');
        }
    }

    return <div>
        <SelectElement
            name='visitorganization'
            options={{
                'crosssection': 'Rows (Cross-sectional)',
                'longitudinal': 'Columns (Longitudinal)',
                'inline': 'Inline values (no download)',
                'raw': 'Raw JSON (debugging only)',
            }}
            label='Display visits as'
            value={visitOrganization}
            multiple={false}
            emptyOption={false}
            onUserInput={
                (name: string, value: VisitOrgType) =>
                    setVisitOrganization(value)
            }
            sortByValue={false}
          />
         {queryTable}
    </div>;
}

/**
 * Organize the session data into tabular data based on
 * the visit organization settings
 *
 * @param {array} resultData - The result of the query as returned by the API
 * @param {string} visitOrganization - The visit organization
 *                                     option selected
 * @param {FullDictionary} fulldict - the full data dictionary
 * @param {APIQueryField[]} fields - the selected fields from the query.
 * @param {function} onProgress - Callback to update progress status display.
 * @returns {string[][]} - The data organized into a tabulated form
 *    such that the result matches the visual table shown by the
 *    frontend cell-for-cell. This may involve adding rows or columns
 *    for the sessions or headers.
 */
function organizeData(
    resultData: string[][],
    visitOrganization: VisitOrgType,
    fulldict: FullDictionary,
    fields: APIQueryField[],
    onProgress: (i: number) => void
) : Promise<TableRow[]> {
    switch (visitOrganization) {
    case 'raw':
        return Promise.resolve(resultData);
    case 'inline':
        // Organize with flexbox within the cell by the
        // formatter
        return Promise.resolve(resultData);
    case 'longitudinal':
        // the formatter splits into multiple cells
        return Promise.resolve(resultData);
    case 'crosssection':
        return new Promise((resolve) => {
            let rowNum = 0;
            const promises: Promise<TableRow[]>[] = [];
            for (const candidaterow of resultData) {
                promises.push(new Promise<TableRow[]>((resolve) => {
                    // Collect list of visits for this candidate
                    const candidatevisits: {[visit: string]: boolean} = {};
                    for (const i in candidaterow) {
                        if (!candidaterow.hasOwnProperty(i)) {
                            continue;
                        }
                        const dictionary = getDictionary(fields[i], fulldict);
                        if (dictionary && dictionary.scope == 'session') {
                            if (candidaterow[i] === null
                                || candidaterow[i] == '') {
                                continue;
                            }
                            const cellobj: any = JSON.parse(candidaterow[i]);
                            for (const session in cellobj) {
                                if (!cellobj.hasOwnProperty(session)) {
                                    continue;
                                }
                                const vl: string = cellobj[session].VisitLabel;
                                candidatevisits[vl] = true;
                            }
                        }
                    }

                    const dataRows: TableRow[] = [];
                    for (const visit in candidatevisits) {
                        if (!candidatevisits.hasOwnProperty(visit)) {
                            continue;
                        }
                        const dataRow: TableRow = [];
                        dataRow.push(visit);
                        for (let i = 0; i < candidaterow.length; i++) {
                          const dictionary = getDictionary(fields[i], fulldict);
                          if (dictionary && dictionary.scope == 'session') {
                            if (candidaterow[i] === null
                                || candidaterow[i] == '') {
                              dataRow.push(null);
                              continue;
                            }
                            const allCells: SessionRowCell[] = Object.values(
                                JSON.parse(candidaterow[i]));
                            const values: SessionRowCell[] = allCells.filter(
                                (sessionval: SessionRowCell) => {
                                  return sessionval.VisitLabel == visit;
                                }
                            );
                            switch (values.length) {
                            case 0:
                              dataRow.push(null);
                              break;
                            case 1:
                              if (typeof values[0].value === 'undefined') {
                                  dataRow.push(null);
                              } else {
                                  dataRow.push(values[0].value);
                              }
                              break;
                            default:
                              throw new Error('Too many visit values');
                            }
                          } else {
                            dataRow.push(candidaterow[i]);
                          }
                        }
                        dataRows.push(dataRow);
                    }
                    onProgress(rowNum++);
                    resolve(dataRows);
                }));
            }

            Promise.all(promises).then((values: TableRow[][]) => {
              const mappedData: TableRow[] = [];
              for (const row of values) {
                mappedData.push(...row);
              }
              resolve(mappedData);
            });
        });
    default: throw new Error('Unhandled visit organization');
    }
}

/**
 * Return a cell formatter specific to the options chosen
 *
 * @param {array} resultData - The result of the query
 * @param {string} visitOrganization - The visit organization
 *                                     option selected
 * @param {array} fields - The fields selected
 * @param {array} dict - The full dictionary
 * @returns {function} - the appropriate column formatter for this data organization
 */
function organizedFormatter(
    resultData: string[][],
    visitOrganization: VisitOrgType,
    fields: APIQueryField[],
    dict: FullDictionary
) {
    let callback;
    switch (visitOrganization) {
    case 'raw':
        /**
         * Callback to return the raw JSON data as returned by the API, in
         * table form for the StaticDataTable
         *
         * @param {string} label - The table header
         * @param {string} cell - The cell value
         * @returns {React.ReactElement} - The table cell
         */
        callback = (label: string, cell: string): ReactNode => {
            return <td>{cell}</td>;
        };
        // callback.displayName = 'Raw session data';
        return callback;
    case 'inline':
        /**
         * Callback to format the data as inline data, with a list for each
         * session inside of a cell for the candidate.
         *
         * @param {string} label - The table header
         * @param {string} cell - The cell value
         * @param {string[]} row - The entire row
         * @param {string[]} headers - The entire row's headers
         * @param {number} fieldNo - the cell index
         * @returns {React.ReactElement} - The table cell
         */
        callback = (
            label: string,
            cell: string,
            row: string[],
            headers: string[],
            fieldNo: number
        ): ReactNode => {
            // if candidate -- return directly
            // if session -- get visits from query def, put in <divs>
            const fieldobj = fields[fieldNo];
            const fielddict = getDictionary(fieldobj, dict);
            if (fielddict === null) {
                return null;
            }
            if (fielddict.scope == 'candidate'
                    && fielddict.cardinality != 'many') {
                if (cell === '') {
                    return <td><i>(No data)</i></td>;
                }

                return <TableCell data={cell} />;
            }
            let val;
            if (fielddict.scope == 'session') {
                let displayedVisits: string[];
                if (fields[fieldNo] && fields[fieldNo].visits) {
                    // need to explicitly tell typescript it's defined otherwise
                    // it thinks visits is string[]|undefined
                    displayedVisits = fields[fieldNo].visits as string[];
                } else {
                    // All visits
                    if (fielddict.visits) {
                        displayedVisits = fielddict.visits;
                    } else {
                        displayedVisits = [];
                    }
                }

                val = displayedVisits.map((visit) => {
                    /**
                     * Maps the JSON value from the session to a list of
                     * values to display to the user
                     *
                     * @param {string} visit - The visit label
                     * @param {string} cell - The JSON returned by the API
                     *                        for this cell
                     * @returns {React.ReactElement} - The HTML list react element
                     */
                    const visitval = (visit: string, cell: string) => {
                        if (cell === '') {
                            return <i>(No data)</i>;
                        }
                        try {
                            const json = JSON.parse(cell);
                            for (const sessionid in json) {
                                if (json[sessionid].VisitLabel == visit) {
                                    if (fielddict.cardinality === 'many') {
                                        return valuesList(
                                            json[sessionid].values
                                        );
                                    } else {
                                        return json[sessionid].value;
                                    }
                                }
                            }
                        } catch (e) {
                            return <i>(Internal error)</i>;
                        }
                        return <i>(No data)</i>;
                    };
                    return (<div key={visit} style={
                                    {
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'start',
                                        // flex: 1 expanded
                                        flexGrow: 1,
                                        flexShrink: 1,
                                        flexBasis: 0,
                                        borderBottom: 'thin dotted black',
                                    }
                            }>
                               <div style={
                                        {
                                            fontWeight: 'bold',
                                            padding: '1em',
                                        }
                                    }
                                >{visit}
                                </div>
                               <div style={
                                    {padding: '1em'}
                                }>
                                    {visitval(visit, cell)}
                                </div>
                            </div>);
                });
            } else {
                return <td>FIXME: {cell}</td>;
            }
            const value = (<div style={
                {
                    display: 'flex',
                    flexDirection: 'column',
                }
            } >
                    {val}
            </div>);
            return <td>{value}</td>;
        };
        // callback.displayName = 'Inline session data';
        return callback;
    case 'longitudinal':
        /**
         * Callback to organize this data longitudinally
         *
         * @param {string} label - The header label
         * @param {string} cell - the JSON value of the cell
         * @param {string[]} row - the entire row
         * @param {string[]} headers - the headers for the table
         * @param {number} fieldNo - The field number of this cell
         * @returns {React.ReactElement} - The table cell
         */
        callback = (
            label: string,
            cell: string,
            row: string[],
            headers: string[],
            fieldNo: number
        ): ReactNode => {
            // We added num fields * num visits headers, but
            // resultData only has numFields rows. For each row
            // we add multiple table cells for the number of visits
            // for that fieldNo. ie. we treat cellPos as fieldNo.
            // This means we need to bail once we've passed the
            // number of fields we have in resultData.
            if (fieldNo >= fields.length) {
                return null;
            }

            // if candidate -- return directly
            // if session -- get visits from query def, put in <divs>
            const fieldobj = fields[fieldNo];
            const fielddict = getDictionary(fieldobj, dict);
            if (fielddict === null) {
                return null;
            }
            switch (fielddict.scope) {
            case 'candidate':
                if (fielddict.cardinality == 'many') {
                    return (<td>
                        FIXME: Candidate cardinality many not implemented.
                        </td>);
                }
                return <TableCell data={cell} />;
            case 'session':
                let displayedVisits: string[];
                if (fieldobj.visits) {
                    displayedVisits = fieldobj.visits;
                } else {
                    // All visits
                    if (fielddict.visits) {
                        displayedVisits = fielddict.visits;
                    } else {
                        displayedVisits = [];
                        }
                }
                if (!displayedVisits) {
                    displayedVisits = [];
                }
                const values = displayedVisits.map((visit) => {
                    if (!cell) {
                        return <td key={visit}><i>(No data)</i></td>;
                    }
                    try {
                        const data = JSON.parse(cell);
                        for (const session in data) {
                          if (data[session].VisitLabel == visit) {
                            return <TableCell
                                key={visit}
                                data={data[session].value}
                            />;
                          }
                        }
                        return <td key={visit}><i>(No data)</i></td>;
                    } catch (e) {
                        return <td key={visit}><i>(Internal error)</i></td>;
                    }
                });
                return <>{values}</>;
            default:
                throw new Error('Invalid field scope');
            }
        };
        // callback.displayName = 'Longitudinal data';
        return callback;
    case 'crosssection':
        /**
         * Callback that organizes data cross-sectionally
         *
         * @param {string} label - The label for the column
         * @param {string} cell - The raw cell value returned by the API.
         * @returns {React.ReactElement} - The table cell for this cell.
         */
        callback = (label: string, cell: JSONString): ReactNode => {
            if (cell === null) {
                return <td><i>No data for visit</i></td>;
            }
            return <TableCell data={cell} />;
        };
        // callback.displayName = 'Cross-sectional data';
        return callback;
    }
}

/**
 * Get the data dictionary for a specific field
 *
 * @param {APIQueryField} fieldobj - The field in the format of props.fields
 * @param {FullDictionary} dict - the full data dictionary
 * @returns {FieldDictionary?} - The field dictionary for this field
 */
function getDictionary(
    fieldobj: APIQueryField,
    dict: FullDictionary,
): FieldDictionary|null {
    if (!dict || !fieldobj
        || !dict[fieldobj.module]
        || !dict[fieldobj.module][fieldobj.category]
        || !dict[fieldobj.module][fieldobj.category][fieldobj.field]
    ) {
        return null;
    }
    return dict[fieldobj.module][fieldobj.category][fieldobj.field];
}

/**
 * Return a cardinality many values field as a list
 *
 * @param {object} values - values object with keys as id
 * @returns {React.ReactElement} - The values in an HTML list
 */
function valuesList(values: KeyedValue[]) {
    const items = Object.values(values).map((val) => {
        return <li key={val.key}>{val.value}</li>;
    });
    return (<ul>
        {items}
    </ul>);
}

type VisitOrgType = 'raw' | 'inline' | 'longitudinal' | 'crosssection';
/**
 * Generate the appropriate table headers based on the visit
 * organization
 *
 * @param {array} fields - the selected fields
 * @param {string} org - the visit organization
 * @param {object} fulldict - the data dictionary
 * @param {function} onProgress - Callback to indicate progress in processing
 * @returns {array} - A promise which resolves to the array of headers to display
 *                    in the frontend table
 */
function organizeHeaders(
    fields: APIQueryField[],
    org: VisitOrgType,
    fulldict: FullDictionary,
    onProgress: (i: number) => void): Promise<string[]> {
    switch (org) {
    case 'raw':
        return Promise.resolve(fields.map((val, i) => {
            onProgress(i);
            return val.field;
        }));
    case 'inline':
        return Promise.resolve(fields.map((val, i) => {
            onProgress(i);
            return val.field;
        }));
    case 'longitudinal':
        const headers: string[] = [];
        let i = 0;
        for (const field of fields) {
            i++;
            const dict = getDictionary(field, fulldict);

            if (dict === null) {
                headers.push('Internal Error');
            } else if (dict.scope == 'candidate') {
                headers.push(field.field);
            } else {
                if (typeof field.visits !== 'undefined') {
                    for (const visit of field.visits) {
                        headers.push(field.field + ': ' + visit);
                    }
                }
            }
            onProgress(i);
        }
        // Split session level selections into multiple headers
        return Promise.resolve(headers);
    case 'crosssection':
        return new Promise( (resolve) => {
            resolve(['Visit Label',
                    ...fields.map((val, i) => {
                        onProgress(i);
                        return val.field;
                    }),
            ]);
        });
    default: throw new Error('Unhandled visit organization');
    }
}

export default ViewData;