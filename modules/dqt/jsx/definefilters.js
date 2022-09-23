import {useState} from 'react';
import {QueryGroup, QueryTerm} from './querydef';
import AddFilterModal from './definefilters.addfiltermodal';

/**
 * Alternate background colour for a QueryTree
 *
 * @param {string} c - the current colour
 *
 * @return {string}
 */
function alternateColour(c) {
    if (c == 'rgb(255, 255, 255)') {
        return 'rgb(240, 240, 240)';
    }
    return 'rgb(255, 255, 255)';
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
    const [deleteItemIndex, setDeleteItemIndex] = useState(null);

    if (props.items.group.length > 0) {
        const renderitem = (item, i) => {
            const operator = i != props.items.group.length-1 ?
                props.items.operator : '';
            let style = {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
            };
            const operatorStyle = {
                alignSelf: 'center',
                fontWeight: 'bold',
            };
            if (deleteItemIndex == i) {
                style.textDecoration = 'line-through';
            }

            const deleteItem = () => {
                const newquery = props.removeQueryGroupItem(
                        props.items,
                        i,
                );
                setModalGroup(newquery);
            };
            if (item instanceof QueryTerm) {
                return <li key={i} style={style}>
                        <div style={{display: 'flex'}}>
                            <CriteriaTerm term={item}
                                mapModuleName={props.mapModuleName}
                                mapCategoryName={props.mapCategoryName}
                            />
                            <div style={{alignSelf: 'center'}}><i
                                title="Delete item"
                                className="fas fa-trash-alt"
                                onClick={deleteItem}
                                onMouseEnter={() => setDeleteItemIndex(i)}
                                onMouseLeave={() => setDeleteItemIndex(null)}
                                style={{cursor: 'pointer'}}
                            />
                            </div>
                        </div>
                        <div style={operatorStyle}>{operator}</div>
                    </li>;
            } else if (item instanceof QueryGroup) {
                const buttonStyle = deleteItemIndex == i ? {
                    textDecoration: 'line-through',
                } : {};

                return (<li key={i} style={style}>
                        <div style={{background: props.backgroundColour}}>
                                <QueryTree items={item}
                                    buttonGroupStyle={props.buttonGroupStyle}
                                    mapModuleName={props.mapModuleName}
                                    mapCategoryName={props.mapCategoryName}
                                    removeQueryGroupItem={
                                            props.removeQueryGroupItem
                                        }
                                    activeGroup={props.activeGroup}
                                    newItem={props.newItem}
                                    newGroup={props.newGroup}
                                    backgroundColour={
                                        alternateColour(props.backgroundColour)
                                    }
                                    deleteItem={deleteItem}
                                    buttonStyle={buttonStyle}
                                    onDeleteHover={() => setDeleteItemIndex(i)}
                                    onDeleteLeave={
                                            () => setDeleteItemIndex(null)
                                    }
                                    />
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
    if (props.activeGroup == props.items) {
        style.background = 'pink';
    }

    let deleteGroupHTML;
    if (props.deleteItem) {
        deleteGroupHTML = (
            <div style={{alignSelf: 'center', marginLeft: 'auto'}}>
                <i className="fas fa-trash-alt"
                    title='Delete Group'

                    onMouseEnter={props.onDeleteHover}
                    onMouseLeave={props.onDeleteLeave}
                    onClick={props.deleteItem}
                    style={{cursor: 'pointer', marginLeft: 'auto'}} />
            </div>
        );
    }
    return (
       <div style={style}>
          {terms}

          <div style={props.buttonGroupStyle}>
              <div style={{margin: 5}}>
                  <ButtonElement
                    label={'Add "' + props.items.operator
                        + '" condition to group'}
                    onUserInput={newItemClick}
                    style={props.buttonStyle}
                    columnSize='col-sm-12'
                  />
              </div>
              <div style={{margin: 5}}>
                  <ButtonElement
                    label={'New "' + antiOperator + '" subgroup'}
                    onUserInput={newGroupClick}
                    style={props.buttonStyle}
                    columnSize='col-sm-12'
                  />
              </div>
              {warning}
              {deleteGroupHTML}
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
    const [deleteItemIndex, setDeleteItemIndex] = useState(null);

    const bGroupStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        marginTop: 10,
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
            <div style={{paddingLeft: '2em',
                paddingRight: '2em'}}>
            <p>Currently querying for ALL candidates.</p>
            <p>You can add conditions by clicking one of the buttons below.</p>
            <p>Click <code>Add Condition</code> to add one or more conditions
               to your filters (ie. "Date Of Birth &lt; 2015-02-15"). <b>This is
               most likely where you want to start your filters.</b>
            </p>
            <p>The "nested groups" options are advanced options for queries
               that do not have any specific condition at the base of the query.
               Use <code>Add nested "or" condition groups</code> if you need to
               build a query of the form
               <i> (a or b) and (c or d) [or (e and f)..]</i>.
               Use <code>Add nested "and" condition groups</code> if you need
               to build a query of the form
               <i> (a and b) or (c and d) [or (e and f)..]</i>. If there are
               *any* conditions at the base of the query such as
               <i> a and (b or c)</i> it is easiest to start with
               <code>Add condition</code> instead of the nested groups.
            </p>
            </div>
            <form>
              <fieldset>
                  <div style={{display: 'flex'}}>
                      <div style={bGroupStyle}>
                          <ButtonElement
                              label='Add Condition'
                              onUserInput={(e) => {
                                  e.preventDefault();
                                  setAddModal(true);
                              }}
                           />
                      </div>
                      <div style={bGroupStyle}>
                          <ButtonElement
                              label='Add nested "or" condition groups'
                              onUserInput={(e) => {
                                  e.preventDefault();
                                  props.query.condition = 'and';
                                  props.addNewQueryGroup(props.query);
                              }}
                           />
                      </div>
                      <div style={bGroupStyle}>
                          <ButtonElement
                              label='Add nested "and" condition groups'
                              onUserInput={(e) => {
                                  e.preventDefault();
                                  props.query.condition = 'or';
                                  props.addNewQueryGroup(props.query);
                              }}
                           />
                      </div>
                   </div>
               </fieldset>
            </form>
        </div>;
    } else if (props.query.group.length == 1 &&
        props.query.group[0] instanceof QueryTerm
    ) {
        // buttons for 1. Add "and" condition 2. Add "or" condition
        displayquery = (<div>
            <p>Currently querying for any candidates with:</p>

            <form>
              <fieldset>
                    <div style={{
                        display: 'flex', marginTop: 10,
                        textDecoration: deleteItemIndex == 0 ?
                            'line-through' : '',
                    }}>
                        <CriteriaTerm
                            term={props.query.group[0]}
                            mapModuleName={mapModuleName}
                            mapCategoryName={mapCategoryName}
                        />
                        <div style={{alignSelf: 'center'}}><i
                            className="fas fa-trash-alt"
                            title='Delete Item'
                            onClick={() => {
                                const newquery = props.removeQueryGroupItem(
                                    props.query,
                                    0
                                );
                                setModalGroup(newquery);
                            }}
                            onMouseEnter={() => setDeleteItemIndex(0)}
                            onMouseLeave={() => setDeleteItemIndex(null)}
                            style={{cursor: 'pointer'}} />
                        </div>
                    </div>
                    <div>
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
                        <div style={bGroupStyle}>
                            <ButtonElement
                                label='New "and" subgroup'
                                onUserInput={(e) => {
                                    e.preventDefault();
                                    props.query.operator = 'or';
                                    props.addNewQueryGroup(props.query);
                                }} />
                            <ButtonElement
                                label='New "or" subgroup'
                                onUserInput={(e) => {
                                    e.preventDefault();
                                    props.query.operator = 'and';
                                    props.addNewQueryGroup(props.query);
                            }} />
                        </div>
                    </div>
                </fieldset>
            </form>
        </div>);
    } else {
        // Add buttons are delegated to the QueryTree rendering so they
        // can be placed at the right level
        displayquery = <div>
            <p>Currently querying for any candidates with:</p>
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
                backgroundColour='rgb(240, 240, 240)'
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
        alignItems: 'center',
    };

    const fieldStyle = {
        width: '33%',
    };
    const opStyle = {
        width: '33%',
        textAlign: 'center',
    };
    const valueStyle = {
        width: '33%',
        alignSelf: 'end',
        display: 'flex',
        alignItems: 'center',
    };

    let visits;
    if (props.term.visits) {
        visits = '';
        if (props.term.visits.length == 1) {
            visits += props.term.visits[0];
        } else {
            for (let i = 0; i < props.term.visits.length; i++) {
                visits += props.term.visits[i];
                if (i == props.term.visits.length-2) {
                    visits += ' or ';
                } else if (i < props.term.visits.length-2) {
                    visits += ', ';
                }
            }
        }
        visits = <div>
            <span style={{fontStyle: 'italic'}}>at visit</span>
            <span> {visits}</span>
        </div>;
    }

    let value = props.term.value;
    if (props.term.op == 'in') {
        const liststyle = {
            margin: 0,
            padding: 0,
            listStylePosition: 'inside',
            listStyleType: 'disc',
        };

        value = <ul style={liststyle}>
            {props.term.value.map((val) => <li>{val}</li>)}
        </ul>;
    }

    let cardinalityWarning;
    if (props.term.dictionary.cardinality == 'many') {
        cardinalityWarning = <i className="fas fa-exclamation-circle"
            style={{fontSize: '2em',
                color: 'rgb(58, 61, 255)',
                paddingLeft: '0.2em',
                cursor: 'help',
            }}
            title={'This field may exist multiple times for a single '
                + props.term.dictionary.scope + ' and must match for *any*'
                + ' of the data points'}
        ></i>;
    }
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
            <div style={valueStyle}>
                <div>{value}</div>
                <div style={{padding: '2em'}}>{visits}</div>
                {cardinalityWarning}
            </div>
        </div>);
}
export default DefineFilters;
