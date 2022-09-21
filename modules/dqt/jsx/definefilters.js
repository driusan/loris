import {useState} from 'react';
import FilterableSelectGroup from './components/filterableselectgroup';
import {QueryGroup, QueryTerm} from './querydef';
import Modal from 'jsx/Modal';

/**
 * Render a modal window for adding a filter
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function AddFilterModal(props) {
    let fieldSelect;
    let operatorSelect;
    let valueSelect;
    let [fieldDictionary, setFieldDictionary] = useState(false);
    let [fieldname, setFieldname] = useState(false);
    let [op, setOp] = useState(false);
    let [value, setValue] = useState('');
    if (props.displayedFields) {
        let options = {'Fields': {}};
        for (const [key, value] of Object.entries(props.displayedFields)) {
            options['Fields'][key] = value.description;
        }
        fieldSelect = <div>
            <h3>Field</h3>
            <FilterableSelectGroup groups={options}
                onChange={(key, fieldname) => {
                    const dict = props.displayedFields[fieldname];
                    setFieldDictionary(dict);
                    setFieldname(fieldname);
                }}
                placeholder="Select a field" />
        </div>;
    }

    if (fieldDictionary) {
        operatorSelect = <div>
            <h3>Operator</h3>
            <SelectElement
               name="operator"
               id="operator"
               label=''
               emptyOption={true}
               sortByValue={false}
               value={op || ''}
               onUserInput={(name, value) => {
                   setOp(value);
               }}
               options={getOperatorOptions(fieldDictionary)}
            />
        </div>;
    }

    if (op) {
        valueSelect = valueInput(fieldDictionary, op, value, setValue);
    }

    return <Modal title="Add criteria"
       show={true}
       throwWarning={true}
       onClose={props.closeModal}
       onSubmit={() => {
           props.addQueryGroupItem(
               props.query,
               {
                   'Module': props.module,
                   'Category': props.category,
                   'Field': fieldname,
                   'Op': op,
                   'Value': value,
               },
               fieldDictionary,
           );

           props.closeModal();
       }}>
            <div style={{width: '100%', padding: '1em'}}>
                <h3>Add filter from category</h3>
                <FilterableSelectGroup groups={props.categories.categories}
                    mapGroupName={(key) => props.categories.modules[key]}
                    onChange={props.onCategoryChange} />
                {fieldSelect}
                {operatorSelect}
                <div>
                {valueSelect}
                </div>
            </div>
    </Modal>;
}
/**
 * Recursively render a tree of AND/OR
 * conditions
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function QueryTree(props) {
    let terms;
    const [hover, setHover] = useState(false);
    if (props.items.group.length > 0) {
        const renderitem = (item, i) => {
            const operator = i != props.items.group.length-1 ?
                props.items.operator : '';
            const style = {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
            };
            const operatorStyle = {
                alignSelf: 'center',
                fontWeight: 'bold',
            };
            if (item instanceof QueryTerm) {
                return <li key={i} style={style}>
                        <div style={{display: 'flex'}}>
                            <CriteriaTerm term={item}
                                mapModuleName={props.mapModuleName}
                                mapCategoryName={props.mapCategoryName}
                            />
                            <div style={{alignSelf: 'center'}}><i
                                className="fas fa-trash-alt"
                                onClick={() => {
                                    const newquery = props.removeQueryGroupItem(
                                        props.items,
                                        i,
                                    );
                                    setModalGroup(newquery);
                                }}
                                style={{cursor: 'pointer'}}
                            />
                            </div>
                        </div>
                        <div style={operatorStyle}>{operator}</div>
                    </li>;
            } else if (item instanceof QueryGroup) {
                return (<li key={i} style={style}>
                        <div>
                            <div style={{display: 'flex'}}>
                                <QueryTree items={item}
                                    buttonGroupStyle={props.buttonGroupStyle}
                                    mapModuleName={props.mapModuleName}
                                    mapCategoryName={props.mapCategoryName}
                                    removeQueryGroupItem={
                                            props.removeQueryGroupItem
                                        }
                                    activeGroup={props.activeGroup}
                                    newItem={props.newItem}
                                    newGroup={props.newGroup} />

                                <div style={{alignSelf: 'center'}}>
                                    <i className="fas fa-trash-alt"
                                    onClick={() => {
                                        const rqgi = props.removeQueryGroupItem;
                                        const newquery = rqgi(
                                            props.items,
                                            i,
                                        );
                                        setModalGroup(newquery);
                                    }}
                                    style={{cursor: 'pointer'}}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={operatorStyle}>{operator}</div>
                </li>);
            } else {
                console.error('Invalid tree');
            }
            return <li>{i}</li>;
        };
        terms = (
            <ul>
                {props.items.group.map(renderitem)}
            </ul>
        );
    }
    let warning;
    switch (props.items.group.length) {
    case 0:
        warning = <div className="alert alert-warning"
                style={{display: 'flex'}}>
            <i className="fas fa-exclamation-triangle"
                style={{
                    fontSize: '1.5em',
                    margin: 7,
                    marginLeft: 10,
                }}></i>
            <div style={{alignSelf: 'center'}}>
                Group does not have any items.
            </div>
        </div>;
        break;
    case 1:
        warning = <div className="alert alert-warning"
                 style={{display: 'flex'}}>
            <i className="fas fa-exclamation-triangle"
                style={{
                    fontSize: '1.5em',
                    margin: 7,
                    marginLeft: 10,
                }}></i>
            <div style={{alignSelf: 'center'}}>
            Group only has 1 item. A group with only 1 item is equivalent
            to not having the group.
            </div>
        </div>;
        break;
    }
    const newItemClick = (e) => {
        e.preventDefault();
        props.newItem(props.items);
    };
    const newGroupClick = (e) => {
        e.preventDefault();
        props.newGroup(props.items);
    };

    const antiOperator = props.items.operator == 'and' ? 'or' : 'and';
    const style = {};
    if (props.activeGroup == props.items || hover) {
        style.background = 'pink';
    }

    return (
       <div style={style}>
          {terms}

          <div style={props.buttonGroupStyle}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            >
              <div style={{margin: 5}}>
                  <ButtonElement
                    label={'Add "' + props.items.operator
                        + '" condition to group'}
                    onUserInput={newItemClick}
                    columnSize='col-sm-12'
                  />
              </div>
              <div style={{margin: 5}}>
                  <ButtonElement
                    label={'New "' + antiOperator + '" subgroup'}
                    onUserInput={newGroupClick}
                    columnSize='col-sm-12'
                  />
              </div>
              {warning}
          </div>
       </div>
    );
}

/**
 * The define filters tab of the DQT
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function DefineFilters(props) {
    let displayquery = '';
    const [addModal, setAddModal] = useState(false);
    // The subgroup used for the "Add Filter" modal window
    // to add to. Default to top level unless click from a
    // query group, in which case the callback changes it
    // to that group.
    const [modalQueryGroup, setModalGroup] = useState(props.query);

    const bGroupStyle = {
        display: 'flex',
        flexWrap: 'wrap',
    };

    const mapModuleName = (name) => {
        return props.categories.modules[name];
    };
    const mapCategoryName = (module, category) => {
        return props.categories.categories[module][category];
        // return props.categories.categories[name];
    };

    if (props.query.group.length == 0) {
        // Only 1 add condition button since "and" or "or"
        // are the same with only 1 term
        displayquery = <div>
            <div>Querying for ALL candidates</div>
            <div style={bGroupStyle}><ButtonElement
                label='Add Condition'
                onUserInput={(e) => {
                    e.preventDefault();
                    setAddModal(true);
                }}
             />
            </div>
        </div>;
    } else if (props.query.group.length == 1) {
        // buttons for 1. Add "and" condition 2. Add "or" condition
        displayquery = (<div>
            Querying for any candidates with
            <div style={{display: 'flex'}}>
                <CriteriaTerm
                    term={props.query.group[0]}
                    mapModuleName={mapModuleName}
                    mapCategoryName={mapCategoryName}
                />
                <div style={{alignSelf: 'center'}}><i
                    className="fas fa-trash-alt"
                    onClick={() => {
                        const newquery = props.removeQueryGroupItem(
                            props.query,
                            0
                        );
                        setModalGroup(newquery);
                    }}
                    style={{cursor: 'pointer'}} />
                </div>
            </div>
            <div style={bGroupStyle}>
                <ButtonElement
                    label='Add "and" condition'
                    onUserInput={(e) => {
                        e.preventDefault();
                        props.query.operator = 'and';
                        setAddModal(true);
                    }} />
                <ButtonElement
                    label='Add "or" condition'
                    onUserInput={(e) => {
                        e.preventDefault();
                        setAddModal(true);
                        props.query.operator = 'or';
                }} />
            </div>

        </div>);
    } else {
        // Add buttons are delegated to the QueryTree rendering so they
        // can be placed at the right level
        displayquery = <div>Querying for any candidates with
      <form>
        <fieldset>
            <QueryTree items={props.query}
                // Only highlight the active group if the modal is open
                activeGroup={addModal ? modalQueryGroup : ''}
                buttonGroupStyle={bGroupStyle}
                removeQueryGroupItem={props.removeQueryGroupItem}
                mapModuleName={mapModuleName}
                mapCategoryName={mapCategoryName}
                newItem={(group) => {
                    setModalGroup(group);
                    setAddModal(true);
                }}
                newGroup={props.addNewQueryGroup}
                />
        </fieldset>
      </form>
      </div>;
    }
    const modal = addModal ? (
        <AddFilterModal
            query={modalQueryGroup}
            closeModal={() => setAddModal(false)}
            addQueryGroupItem={(querygroup, condition, dictionary) => {
                const newquery = props.addQueryGroupItem(
                    querygroup,
                    condition,
                    dictionary
                );
                setModalGroup(newquery);
            }}
            categories={props.categories}
            onCategoryChange={props.onCategoryChange}
            displayedFields={props.displayedFields}

            module={props.module}
            category={props.category}
         />)
         : '';

    return (<div>
          {modal}
          <h1>Current Query</h1>
          {displayquery}
      </div>
      );
}

/**
 * Convert an operator serialization back to unicode for
 * display.
 *
 * @param {string} op - the backend operator
 *
 * @return {string}
 */
function op2str(op) {
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
    case 'isnotnull': return 'has data';
    case 'isnull': return 'has no data';
    case 'exists': return 'exists';
    case 'notexists': return 'does not exist';
    case 'numberof': return 'number of';
    default: console.error('Unhandle operator');
    }
};

/**
 * Get a list of possible query operators based on a field's dictionary
 *
 * @param {object} dict - the field dictionary
 *
 * @return {object}
 */
function getOperatorOptions(dict) {
    let options;

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


/**
 * Returns an input field for getting the value of a filter criteria
 * in a context-sensitive way
 *
 * @param {object} fielddict - The field dictionary
 * @param {string} op - The operator selected
 * @param {string} value - The current value
 * @param {string} setValue - a callback when a new value is selected
 *
 * @return {ReactDOM}
 */
function valueInput(fielddict, op, value, setValue) {
   switch (op) {
      case 'exists':
      case 'notexists':
      case 'isnull':
      case 'isnotnull':
          return <span/>;
      case 'numberof':
          return <NumericElement
             value={value}
             onUserInput={(name, value) => setValue(value)} />;
    }

   switch (fielddict.type) {
       case 'date':
          return <DateElement
             name="date"
             value={value}
             onUserInput={(name, value) => setValue(value)} />;
       case 'time':
           return <input name="value" type="time"
               value={value || '12:00pm'}
               onChange={setValue}
           />;
       case 'URI':
           return <input name="value" type="url" value={value || ''}
               onChange={setValue}
               />;
       case 'integer':
          return <NumericElement
             value={value}
             onUserInput={(name, value) => setValue(value)} />;
       case 'boolean':
           return <SelectElement
               label=''
               name='value'
               options={{'true': 'true', 'false': 'false'}}
               onUserInput={(name, value) => setValue(value)}
               value={value}
               sortByValue={false}
               />;
       case 'enumeration':
           let opts = {};
           for (let i = 0; i < fielddict.options.length; i++) {
               const opt = fielddict.options[i];
               opts[opt] = opt;
           }
           return <SelectElement
               label=''
               multiple={op == 'in'}
               name='value'
               options={opts}
               onUserInput={(name, value) => setValue(value)}
               value={value}
               sortByValue={false}
           />;
       default:
            return <TextboxElement
               onUserInput={(name, value) => setValue(value)}
               value={value} />;
   }
};

/**
 * Renders a single term of a condition
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function CriteriaTerm(props) {
    const containerStyle={
        display: 'flex',
        flexWrap: 'nowrap',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
    };

    const fieldStyle = {
        width: '33%',
        alignSelf: 'start',
    };
    const opStyle = {
        width: '33%',
        alignSelf: 'center',
    };
    const valueStyle = {
        width: '33%',
        alignSelf: 'end',
    };
    return (
        <div style={containerStyle}>
            <div style={fieldStyle}>
                <div title={props.term.fieldname}>
                    {props.term.dictionary.description}
                </div>
                <div style={{fontSize: '0.8em', color: '#aaa'}}>
                {props.mapCategoryName(props.term.module, props.term.category)}
                &nbsp;({props.mapModuleName(props.term.module)})
                </div>
            </div>
            <div style={opStyle}>{op2str(props.term.op)}</div>
            <div style={valueStyle}>{props.term.value}</div>
        </div>);
}
export default DefineFilters;
