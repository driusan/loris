import React, {useState, useEffect} from 'react';
import DataTable from 'jsx/DataTable';
import Panel from 'jsx/Panel';

/**
 * Return a JSX component denoting the filter state
 *
 * @param {object} props - React props
 *
 * @return {JSX}
 */
function SearchTypeSelect(props) {
    if (props.searchtype == 'sessions') {
        return (<span className='btn-group' role='group'>
                    <button className='btn btn-primary'
                           type="button"
                           onClick={() => props.setSearchType('candidates')}>
                        Candidates
                    </button>
                    <button className='btn btn-primary active'
                       type="button"
                       onClick={() => props.setSearchType('sessions')} >
                        Sessions
                </button>
            </span>
        );
    }
    return (<span className='btn-group' role='group'>
                <button className='btn btn-primary active'
                        type="button"
                        onClick={() => props.setSearchType('candidates')}>
                    Candidates
                </button>
                <button className='btn btn-primary'
                        type="button"
                        onClick={() => props.setSearchType('sessions')}>
                    Sessions
                </button>
            </span>
    );
}

/**
 * Extracts the scope for a field from the data dictionary
 *
 * @param {object} dictionary - The data dictionary
 * @param {object} field - the field whose scope should
 *      be extracted
 *
 * @return {string}
 */
function getFieldScope(dictionary, field) {
    const fmod = dictionary[field.module];
    const fcat = fmod[field.category];
    const fdict = fcat[field.field];
    return fdict.scope;
}
/**
 * React
 *
 * @param {object} props - React props
 *
 * @return {JSX}
 */
function EditField(props) {
    const [forceVisitRefresh, setForceVisitRefresh] = useState(0);
    const [validvisits, setVisitList] = useState({});
    useEffect(() => {
        const fetchData = async () => {
            if (!field.module || !field.field) {
                return;
            }

            if (getFieldScope(props.dictionary, field) === 'candidate') {
                return;
            }

            const result = await fetch(

                props.VisitListURL
                    + '?module='
                    + field.module
                    + '&item=' + field.field,
                {credentials: 'same-origin'}
            );

            const results = await result.json();
            let resultobj = {};
            for (const visit of results.Visits) {
                resultobj[visit] = visit;
            }
            setVisitList(resultobj);
        };
        fetchData();
    }, [forceVisitRefresh]);

    const andword = props.last != true ? 'and' : '';
    let field = props.field;

    const setField = (f, v) => {
        if (f == 'module' || f == 'field') {
            setForceVisitRefresh(forceVisitRefresh + 1);
        }
        field[f] = v;
        if (f == 'module') {
            delete field['category'];
            props.loadModule(v);
        }
        props.setCriteria(props.criteria);
    };

    const setValue = (e) => {
        field['value'] = e.target.value;
        props.setCriteria(props.criteria);
    };

    const addFieldVisit = (visit) => {
        if (!field['visits']) {
            field.visits = {};
        }
        field.visits[visit] = true;
        props.setCriteria(props.criteria);
    };

    const removeFieldVisit = (visit) => {
        delete field.visits[visit];
        if (Object.keys(field.visits).length == 0) {
            delete field.visits;
        }
        props.setCriteria(props.criteria);
    };

    let categorydropdown;
    if (field.module && field.module != '') {
        categorydropdown = <SelectElement
            label='Category'
            name='category'
            options={props.categories.categories[field.module]}
            onUserInput={setField}
            value={field.category}
        />;
    } else {
        categorydropdown = <SelectElement
            label='Category'
            name='category'
            options={{}}
            disabled={true}
        />;
    }

    let fields = {};
    let fielddict = [];
    if (field.module && field.category
        && props.dictionary
        && props.dictionary[field.module]
        && props.dictionary[field.module][field.category]) {
        const entries =
            Object.entries(props.dictionary[field.module][field.category]);
        for (const [key, value] of entries) {
            if (key == field.field) {
                fielddict = value;
            }
            fields[key] = value.description;
        }
    }

    const fieldoptions = (dict) => {
        let options;

        // Possible types are: DateType.php
        // Enumeration.php
        // Interval.php
        // TimeType.php
        // DecimalType.php
        // IntegerType.php
        // StringType.php
        // URI.php
        if (dict.type == 'integer' || dict.type == 'date' ||
            dict.type == 'interval' || dict.type == 'time' ||
            dict.type == 'decimal') {
            // Comparable data types
            options = {
                'lt': '<',
                'lte': '≤',
                'eq': '=',
                'neq': '≠',
                'gte': '≥',
                'gt': '>',
            };
        } else if (dict.type == 'enumeration') {
            // Enumerations are a dropdown. Comparable operators
            // are meaningless, but the options are a dropdown
            // and we might be looking for an option "in" any
            // of the selected choices.
            options = {
                'eq': '=',
                'neq': '≠',
                'in': 'in',
            };
        } else if (dict.type == 'string' ||
            dict.type == 'URI') {
            // We might be looking for a substring.
            options = {
                'eq': '=',
                'neq': '≠',
                'startsWith': 'starts with',
                'contains': 'contains',
                'endsWith': 'ends with',
            };
        } else {
            // fall back to == and !=, valid for any type.
            options = {'eq': '=', 'neq': '≠'};
        }

        // Possible cardinalities are unique, single,
        // optional, or many. Unique and single don't
        // change the possible operators, optional or
        // 1-many cardinalities have a couple more
        // things you can check.
        if (dict.cardinality == 'optional') {
            options['isnotnull'] = 'has data';
            options['isnull'] = ' has no data';
        } else if (dict.cardinality == 'many') {
            options['exists'] = 'exists';
            options['notexists'] = 'does not exist';
            options['numberof'] = 'number of';
        }
        return options;
    };

    const valueinput = () => {
        switch (field.op) {
            case 'exists':
            case 'notexists':
            case 'isnull':
            case 'isnotnull':
                return <span/>;
                // <input type="hidden" value={field.op} name="value"/>;
            case 'numberof':
                return <input name="value"
                            type="number"
                            value={field.value || 0}
                            onChange={setValue}
                />;
        }

        switch (fielddict.type) {
        case 'date':
           return <input name="value" type="date"
                value={field.value || ''}
                onChange={setValue}
           />;
        case 'time':
           return <input name="value" type="time"
                value={field.value || '12:00pm'}
                onChange={setValue}
           />;
        case 'URI':
           return <input name="value" type="url" value={field.value || ''}
                onChange={setValue}
           />;
        case 'integer':
           return <input name="value" type="number" value={field.value || 0}
                onChange={setValue}
           />;
        case 'enumeration':
           let opts = {};
           for (let i = 0; i < fielddict.options.length; i++) {
               const opt = fielddict.options[i];
               opts[opt] = opt;
           }
           return <SelectElement
                        label=''
                        multiple={field.op == 'in'}
                        name='value'
                        options={opts}
                        onUserInput={setField}
                        value={field.value}
                        sortByValue={false}
                    />;
        default:
           return <input name="value" type="text" value={field.value || ''}
                onChange={setValue}
           />;
        }
        // Possible types are: DateType.php (done)
        // Enumeration.php
        // Interval.php (Default is fine, I guess?)
        // TimeType.php (done)
        // DecimalType.php (default is kind of fine)
        // IntegerType.php (done)
        // StringType.php (default is fine)
        // URI.php  (done)
    };

    const actionstyle = {
        cursor: 'pointer',
        fontSize: '1.2em',
        padding: '0.75ex',
        marginLeft: '2px',
        marginRight: '2px',
    };

    const fieldIsValid = () => {
        if (!field.field) {
            return false;
        }

        if (!field.op) {
            return false;
        }

        // We don't care about the value for these types
        switch (field.op) {
        case 'exists':
        case 'notexists':
        case 'isnull':
        case 'isnotnull':
            return true;
        }

        // FIXME: only some ops require values, for others
        // the empty string is valid..
        if (!field.value) {
            return false;
        }
        return true;
    };

    let checkmarkstyle = {
        ...actionstyle,
        color: 'green',
    };

    let editClick = () => setField('editstate', 'done');
    if (!fieldIsValid()) {
        checkmarkstyle.color='grey';
        checkmarkstyle.cursor='not-allowed';
        editClick = () => {};
    }

    const actions = <div className="row"
       style={{width: '100%', textAlign: 'center'}}>
           <span style={checkmarkstyle}
                onClick={editClick}>Accept <i className="fas fa-check"></i>
           </span>
           <span style={actionstyle}
              onClick={() => props.deleteCriteria(props.idx)}>Remove
           <i className="fa fa-trash-alt"></i>
           </span>
    </div>;

    const visitSelect = () => {
        if (fielddict.scope != 'session') {
            return;
        }
        const fields = validvisits;

        const visitlist = () => {
            const addVisit = (label) => {
                return (fieldname, value) => {
                    // fieldname is unused, but it needs
                    // to be in the signature to get to the
                    // second parameter..
                    if (value) {
                        addFieldVisit(label);
                    } else {
                        removeFieldVisit(label);
                    }
                };
            };

            const entries =
                Object.keys(fields);
            return entries.map((visit) => {
                const checked = (field.visits && field.visits[visit])
                    ? true
                    : false;
                return <div key={'visit_' + visit}>
                            <CheckboxElement
                                label={visit}
                                value={checked}
                                name="visit"
                                onUserInput={addVisit(visit)} />
                    </div>;
            });
        };

        return <div className="row">
                <div className="col-xs-8">
                    <label className="col-xs-4">
                        At at least one visit of<br />
                (leave all visits unchecked for "any visit"):
                    </label>
                    <span className="col-xs-8">
                        {visitlist()}
                    </span>
                </div>
            </div>;
    };

    return (<div className="row">
              <div className="row">
                  <div className="col-xs-4">
                    <SelectElement
                        label='Module'
                        name='module'
                        options={props.categories.modules}
                        onUserInput={setField}
                        value={field.module}
                    />
                  </div>
                  <div className="col-xs-4">
                      {categorydropdown}
                  </div>
                  <div className="col-xs-4">&nbsp;
                  </div>
              </div>
              <div className="row">
                <div className="col-xs-4">
                    <SelectElement
                        label='Field'
                        name='field'
                        options={fields}
                        value={field.field}
                        onUserInput={setField}
                        sortByValue={false}
                    />
                </div>
                <div className="col-xs-4">
                    <SelectElement
                        label=''
                        name='op'
                        options={fieldoptions(fielddict)}
                        sortByValue={false}
                        onUserInput={setField}
                        value={field.op}
                    />
                </div>
                <div className="col-xs-4">
                    {valueinput()}
                </div>
              </div>
              {visitSelect()}
              {actions}
              <div className="row"
                    style={
                        {
                            width: '100%',
                            textAlign: 'center',
                            marginBottom: '15px',
                        }
                    }>
                    {andword}
              </div>
            </div>);
}

/**
 * Displays a field
 *
 * @param {object} props - React props
 *
 * @return {JSX}
 */
function DisplayField(props) {
    const andword = props.last != true ? 'and' : '';
    let field = props.field;
    const setField = (f, v) => {
        field[f] = v;
        props.setCriteria(props.criteria);
    };

    const displayOp = (op) => {
        switch (op) {
        case 'lt': return '<';
        case 'lte': return '≤';
        case 'eq': return '=';
        case 'neq': return '≠';
        case 'gte': return '≥';
        case 'gt': return '>';
        case 'in': return 'in';
        case 'startsWith': return 'starts with';
        case 'contains': return 'contains';
        case 'endsWith': return 'ends with';
        case 'exists': return 'exists';
        case 'notexists': return 'does not exist';
        case 'isnull': return 'has no data';
        case 'isnotnull': return 'has data';
        case 'numberof': return 'number of equals';
        default: return op;
        }
    };

    const visitlist = () => {
        if (getFieldScope(props.dictionary, props.field) === 'candidate') {
            return <span className="col-sm-2">for the candidate</span>;
        }

        if (!field.visits) {
            return <span className="col-sm-2">at any visit</span>;
        }

        const visits = Object.keys(field.visits);
        if (visits.length == 1) {
            return (<span className="col-sm-2">
                at visit {visits[0]}
                </span>);
        }

        let str = '';
        for (let idx = 0; idx < visits.length; idx++) {
            const visit = visits[idx];
            if (idx == 0) {
                str += visit;
            } else if (idx == visits.length-1) {
                str += ' or ' + visit;
            } else {
                str += ', ' + visit;
            }
        }

        return (<span className="col-sm-2">
            at at least one visit of {str}
            </span>);
    };

    return <div className="row">
        <span className="col-sm-3">{props.field.field}</span>
        <span className="col-sm-2">{displayOp(props.field.op)}</span>
        <span className="col-sm-2">{props.field.value}</span>
        {visitlist()}
        <span className="col-sm-2">
            <i
                className="fas fa-edit"
                style={{cursor: 'pointer',
            marginLeft: '1ex',
            marginRight: '1ex'}}
                onClick={() => setField('editstate', 'editing')}>
            </i>
            <i
                className="fa fa-trash-alt"
                style={{cursor: 'pointer',
                    marginRight: '1ex'}}
                onClick={() => props.deleteCriteria(props.idx)}>
            </i>
            {andword}
        </span>
        </div>;
}
/**
 * Return a JSX component denoting the filter state
 *
 * @param {object} props - React props
 *
 * @return {JSX}
 */
function FieldList(props) {
    if (props.criteria.length == 0) {
        return (<div>
            <h4>All {props.searchtype}</h4>
            <button className="btn btn-primary"
                    type="button"
                    onClick={props.onAddCriteria}>
                    Add Criteria
            </button>
        </div>);
    }

    let canAddNew = true;
    const fieldlist = props.criteria.map((row, idx) => {
        let style = {};

        if (idx % 2 == 1) {
            style.backgroundColor = '#e1e1e1';
        }
        if (row.editstate=='new' || row.editstate=='editing') {
            canAddNew = false;
            style.padding = '1.2em';
            return (<li key={'row' + idx} className="row"
                        style={style}>
                        <EditField
                            field={row}
                            idx={idx}
                            last={idx == props.criteria.length-1}
                            setCriteria={props.setCriteria}
                            criteria={props.criteria}
                            deleteCriteria={props.deleteCriteria}
                            categories={props.categories}
                            loadModule={props.loadModule}
                            dictionary={props.dictionary}

                            VisitListURL={props.VisitListURL}
                        />
            </li>);
        }

        style.padding = '1ex';
        return (<li key={row + idx} style={style}>
            <DisplayField
                field={row}
                idx={idx}
                last={idx == props.criteria.length-1}
                criteria={props.criteria}
                deleteCriteria={props.deleteCriteria}
                setCriteria={props.setCriteria}
                loadModule={props.loadModule}
                dictionary={props.dictionary}
            />
            </li>);
    });

    const addButton = canAddNew ?
            <button className="btn btn-primary"
                    type="button"
                    onClick={props.onAddCriteria}>
                    Add Criteria
            </button>
        : <button className="btn btn-primary disabled"
                title="Must finish editing current criteria before adding more"
                style={{cursor: 'not-allowed', pointerEvents: 'auto',
                    color: 'white'}}
                    type="button">
                    Add Criteria
            </button>;

    return (<div>
        <h4>with</h4>
        <ul style={{listStyleType: 'none', padding: 0, margin: '1em'}}>
            {fieldlist}
        </ul>
        <div>{addButton}</div>
        </div>);
}

/**
 * Return a JSX component denoting the filter state
 *
 * @param {object} props - React props
 *
 * @return {JSX}
 */
function CandidateCriteria(props) {
    return (
      <form name="criteria" action="#">
        <fieldset>
            <legend>Selection</legend>
            <div>I am looking for &nbsp;
                <SearchTypeSelect
                    searchtype={props.searchtype}
                    setSearchType={props.setSearchType}/>
          </div>
            <FieldList
                criteria={props.criteria}
                onAddCriteria={props.onAddCriteria}
                deleteCriteria={props.deleteCriteria}
                setCriteria={props.setCriteria}
                searchtype={props.searchtype}
                categories={props.categories}
                loadModule={props.loadModule}
                dictionary={props.dictionary}

                VisitListURL={props.VisitListURL}
            />
            <button type="button" className="btn btn-primary"
                onClick={props.search}>
                Search
            </button>
        </fieldset>
    </form>);
}

/**
 * Display the results of the current search query
 *
 * @param {object} props - React props
 *
 * @return {JSX}
 */
function Results(props) {
    if (!props.data) {
        return <div>No search performed</div>;
    }
    if (props.data.length == 0) {
        return <div>No results found.</div>;
    }

    const fields = [
        {
            'label': 'PSCID',
            'show': true,
        },
        {
            'label': 'CandID',
            'show': true,
        },
        {
            'label': 'Site',
            'show': true,
        },
        {
            'label': 'Subproject',
            'show': true,
        },
        {
            'label': 'Entity Type',
            'show': true,
        },
        {
            'label': 'Scan Done',
            'show': true,
        },
        {
            'label': 'Participant Status',
            'show': true,
        },
        {
            'label': 'DoB',
            'show': true,
        },
        {
            'label': 'Sex',
            'show': true,
        },
        {
            'label': 'Visit Count',
            'show': true,
        },
        {
            'label': 'Feedback',
            'show': true,
        },
        {
            'label': 'Latest Visit Status',
            'show': true,
        },
        {
            'label': 'Project',
            'show': true,
        },
        {
            'label': 'EDC',
            'show': true,
        },
    ];

    if (!props.data.map) {
        console.log(props.data);
    }
    const datarows = props.data.map((row) => {
        if (!row.Site) {
            console.log(row);
        }
        let scandone = 'N';
        for (let i = 0; row.ScanDone && i < row.ScanDone.length; i++) {
            if (row.ScanDone[i] == 'Y') {
                scandone = 'Y';
            }
        }


        return [
            row.PSCID,
            row.CandID,
            row.Site.join(', '),
            row.Subproject.join(', '),
            row.EntityType,
            scandone,
            row.ParticipantStatus,
            row.DoB,
            row.Sex,
            row.VisitLabel.length ? row.VisitLabel.length : 0,
            '', // feedback
            '', // Latest visit status
            row.Project.join(', '),
            row.EDC, // EDC
        ];
    });

    return <DataTable
        data={datarows}
        fields={fields}
        />;
}
/**
 * Return the main index page for the candidates module
 *
 * @param {object} props - React props
 *
 * @return {JSX}
 */
function CandidatesIndex(props) {
    const [criteria, setCriteria] = useState([]);
    const [searchType, setType] = useState('candidates');
    const [categories, setCategories] = useState({});
    const [dictionary, setDictionary] = useState({});
    const [curmodule, setSelectedModule] = useState('');
    const [resultdata, setResultData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const result = await fetch(
                props.CategoriesURL,
                {credentials: 'same-origin'}
            );
            setCategories(await result.json());
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (curmodule == '' || dictionary[curmodule]) {
            return;
        }

        const fetchData = async () => {
            fetch(
                props.ModuleDictURLBase + curmodule,
                {credentials: 'same-origin'}
            ).then((response) => response.json())
            .then((result) => {
                let newdictionary = {
                    ...dictionary,
                };
                newdictionary[curmodule] = result;
                setDictionary(newdictionary);
            });
        };
        fetchData();
    }, [curmodule]);

    const addCriteria = () => {
        const newcriteria = [...criteria, {editstate: 'new'}];
        setCriteria(newcriteria);
    };

    const deleteCriteria = (idx) => {
        const newcriteria = criteria.filter((el, fidx) => {
            return idx != fidx;
        });
        setCriteria(newcriteria);
    };

    const resetCriteria = (value) => {
        const newcriteria = [...criteria];
        setCriteria(newcriteria);
    };

    const performSearch = () => {
        let payloadcriteria = {};

        for (const value of criteria) {
            if (!payloadcriteria.hasOwnProperty(value.module)) {
                payloadcriteria[value.module] = [];
            }

            let fieldobj = {
                    field: value.field,
                    op: value.op,
                    value: value.value,
                };

            if (value.visits) {
                fieldobj.visits = Object.keys(value.visits);
            }
            payloadcriteria[value.module].push(fieldobj);
        }

        const payload = {
            type: searchType,
            criteria: payloadcriteria,
            fields: {
                'candidate_parameters': [
                    'PSCID',
                    'CandID',
                    'Site',
                    'Subproject',
                    'EntityType',
                    'ParticipantStatus',
                    'DoB',
                    'Sex',
                    'Project',
                    'VisitLabel',
                    'EDC',
                ],
                'imaging_browser': [
                    'ScanDone',
                ],
            },
        };

        fetch(props.SearchURL,
            {
                method: 'POST',
                credentials: 'same-origin',
                cache: 'no-cache',
                body: JSON.stringify(payload),
            }
        ).then((resp) => resp.json())
        .then((result) => {
            setResultData(result.data);
        });
    };

    return (<Panel title="Candidate List">
                <CandidateCriteria criteria={criteria}
                    onAddCriteria={addCriteria}
                    deleteCriteria={deleteCriteria}
                    setCriteria={resetCriteria}
                    searchtype={searchType}
                    setSearchType={setType}
                    loadModule={setSelectedModule}
                    categories={categories}
                    dictionary={dictionary}
                    search={performSearch}

                    VisitListURL={props.VisitListURL}
                />
            <Results data={resultdata} />
      </Panel>
    );
}

window.addEventListener('load', () => {
  ReactDOM.render(
      <CandidatesIndex
        CategoriesURL={loris.BaseURL + '/dictionary/categories'}
        ModuleDictURLBase={loris.BaseURL + '/dictionary/module/'}
        SearchURL={loris.BaseURL + '/candidates/search'}
        VisitListURL={loris.BaseURL + '/candidates/visitlist'}
      />,
      document.getElementById('lorisworkspace')
  );
});
