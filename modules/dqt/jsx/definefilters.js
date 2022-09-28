import {useState} from 'react';
import {QueryTerm} from './querydef';
import AddFilterModal from './definefilters.addfiltermodal';
import ImportCSVModal from './definefilters.importcsvmodal';
import QueryTree from './querytree';
import CriteriaTerm from './criteriaterm';


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
    const [csvModal, setCSVModal] = useState(false);
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

    const mapModuleName = props.mapModuleName;
    const mapCategoryName = props.mapCategoryName;

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
            <p>You can also import a population from a CSV by clicking
                the <code>Import from CSV</code> button.</p>
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
                  <div style={bGroupStyle}>
                      <ButtonElement
                          label='Import from CSV'
                          onUserInput={(e) => {
                              e.preventDefault();
                              // Need to be sure that we've loaded
                              // candidate_parameters so it's in
                              // fulldictionary
                              props.getModuleFields(
                                'candidate_parameters',
                                'identifiers'
                              );
                              setCSVModal(true);
                          }}
                       />
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
                            fulldictionary={props.fulldictionary}
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
                setModalGroup={setModalGroup}
                backgroundColour='rgb(240, 240, 240)'
                newGroup={props.addNewQueryGroup}
                fulldictionary={props.fulldictionary}
                />
        </fieldset>
      </form>
      </div>;
    }
    const modal = addModal ? (
        <AddFilterModal
            query={modalQueryGroup}
            closeModal={() => setAddModal(false)}
            addQueryGroupItem={(querygroup, condition) => {
                const newquery = props.addQueryGroupItem(
                    querygroup,
                    condition,
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
    const csvModalHTML = csvModal ? (
        <ImportCSVModal
            setQuery={props.setQuery}
            closeModal={() => setCSVModal(false)}
            />
    ) : '';

    return (<div>
          {modal}
          {csvModalHTML}
          <h1>Current Query</h1>
          {displayquery}
      </div>
      );
}

export default DefineFilters;
