import ExpansionPanels from './components/expansionpanels';
import swal from 'sweetalert2';
import FieldDisplay from './fielddisplay';
import {useEffect, useState} from 'react';
import QueryTree from './querytree';
import {QueryGroup} from './querydef';
import NameQueryModal from './welcome.namequerymodal';


/**
 * Return the welcome tab for the DQT
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function Welcome(props) {
    return (
        <div>
           <h1 style={{
             color: '#0a3572',
             textAlign: 'center',
             padding: '30px 0 0 0',
           }}>
               Welcome to the Data Query Tool
            </h1>
            <ExpansionPanels
                panels={[
                    {
                      title: 'Introduction',
                      content: (
                        <div>
                          <p>The data query tool allows you to query data
                          within LORIS. There are three steps to defining
                          a query:
                          </p>
                          <ol>
                            <li>First, you must select the fields that you're
                                interested in on the <code>Define Fields</code>
                                page.</li>
                            <li>Next, you can optionally define filters on the
                                <code>Define Filters</code> page to restrict
                                the population that is returned.</li>
                            <li>Finally, you view your query results on
                                the <code>View Data</code> page</li>
                          </ol>
                          <p>Instead of building a query, you can reload a
                            recently run query below.</p>
                          <p>Clicking on on a table below cell in either the
                             <code>Fields</code> or <code>Filters</code>
                             cell will load the query fields and criteria
                             of the recent query. Clicking on the <code>
                             Time Run</code> cell of a query will reload
                             the data that was returned at that time, without
                             re-running the query.</p>
                           <ButtonElement
                                onUserInput={props.onContinue}
                                label="Continue to Define Fields" />
                        </div>
                      ),
                      alwaysOpen: true,
                      defaultOpen: true,
                    },
                    {
                      title: 'Recent Queries',
                      content: (
                        <div>
                          <QueryList
                                queries={props.recentQueries}
                                loadQuery={props.loadQuery}

                                pinQuery={props.pinQuery}
                                unpinQuery={props.unpinQuery}

                                shareQuery={props.shareQuery}
                                unshareQuery={props.unshareQuery}

                                reloadQueries={props.reloadQueries}

                                getModuleFields={props.getModuleFields}
                                mapModuleName={props.mapModuleName}
                                mapCategoryName={props.mapCategoryName}
                                fulldictionary={props.fulldictionary}
                            />
                        </div>
                      ),
                      alwaysOpen: false,
                      defaultOpen: true,
                    },
                    {
                      title: 'Shared Queries',
                      content: (
                        <div>
                          <QueryList
                                queries={props.sharedQueries}
                                loadQuery={props.loadQuery}

                                getModuleFields={props.getModuleFields}
                                mapModuleName={props.mapModuleName}
                                mapCategoryName={props.mapCategoryName}
                                fulldictionary={props.fulldictionary}
                            />
                        </div>
                      ),
                      alwaysOpen: false,
                      defaultOpen: true,
                    },
                    ]
                  }
                  />
              </div>
          );
}

/**
 * Display a list of queries
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function QueryList(props) {
    const [nameModalID, setNameModalID] = useState(null);
    const [queryName, setQueryName] = useState(null);
    useEffect(() => {
        const modules = new Set();
        props.queries.forEach((query) => {
            query.fields.forEach((field) => {
                modules.add(field.module);
            });
            if (query.criteria) {
                const addModules = (querygroup) => {
                    querygroup.group.forEach((item) => {
                        if (item.module) {
                            modules.add(item.module);
                        } else if (item instanceof QueryGroup) {
                            addModules(item);
                        }
                    });
                };
                addModules(query.criteria);
            }
        });
        modules.forEach((module) => {
                props.getModuleFields(module);
        });
    }, [props.queries]);
    useEffect(() => {
        console.log('quername effect', queryName);
        if (!nameModalID || !nameModalID) {
            return;
        }
        fetch(
            '/dqt/queries/' + nameModalID
                + '?name=' + encodeURIComponent(queryName),
            {
                method: 'PATCH',
                credentials: 'same-origin',
            },
        ).then((response) => {
            if (response.ok) {
                setNameModalID(null);
                setQueryName(null);
                props.reloadQueries();
            }
        });
    }, [queryName]);

    const nameModal = nameModalID == null ? '' :
        <NameQueryModal
            onSubmit={(name) => setQueryName(name)}
            closeModal={() => setNameModalID(null)}
            QueryID={nameModalID}
        />;
    return (<div>
        {nameModal}
        {props.queries.map((query, idx) => {
            let pinnedIcon;
            let sharedIcon;

            if (query.Pinned) {
              pinnedIcon = <span
                    style={{cursor: 'pointer'}}
                    onClick={
                        () => props.unpinQuery(query.QueryID)
                    }
                    title="Unstar"
                    className="fa-stack">
                <i style={
                    {color: 'yellow'}}
                    className="fas fa-star fa-stack-1x"
                    />
                <i style={
                    {color: 'black'}}
                    className="far fa-star fa-stack-1x"
                    />
                </span>;
            } else {
              pinnedIcon = <span
                    style={{cursor: 'pointer'}}
                    title="Star"
                    onClick={
                        () => props.pinQuery(query.QueryID)
                    }
                    className="fa-stack">
                <i className="far fa-star fa-stack-1x"/>
                </span>;
            }

            if (query.Shared) {
                sharedIcon = <span className="fa-stack"
                                style={{cursor: 'pointer'}}
                                title="Unshare"
                                onClick={
                                    () =>
                                       props.unshareQuery(query.QueryID)
                                }>
                                <i style={{color: 'blue'}}
                                    className="fas fa-share-alt fa-stack-1x" />
                          </span>;
            } else {
                sharedIcon = <span className="fa-stack"
                                style={{cursor: 'pointer'}}
                                title="Share"
                                onClick={
                                    () =>
                                       props.shareQuery(query.QueryID)
                                }>
                                <i style={{color: 'black'}}
                                    className="fas fa-share-alt fa-stack-1x" />
                            </span>;
            }

            const loadQuery = () => {
               props.loadQuery(
                 query.fields,
                 query.criteria,
               );
               swal.fire({
                 type: 'success',
                 title: 'Query Loaded',
                 text: 'Successfully loaded query.',
               });
            };

            const loadIcon = <span onClick={loadQuery}
                                title="Reload query"
                                style={{cursor: 'pointer'}}
                                className="fa-stack">
                                <i className="fas fa-sync fa-stack-1x"></i>
                             </span>;

            let msg = '';
            if (query.RunTime) {
                const desc = query.Name
                    ? <span>
                        <b>{query.Name}</b>
                        &nbsp;<i>(Run at {query.RunTime})</i>
                      </span>
                    : <i>You ran this query at {query.RunTime}</i>;
                const nameIcon = <span title="Name query"
                                style={{cursor: 'pointer'}}
                                className="fa-stack"
                                onClick={() => setNameModalID(query.QueryID)}>
                                   <i
                                    className="fas fa-pencil-alt fa-stack-1x">
                                   </i>
                                </span>;
                msg = <div>{desc}
                       &nbsp;{pinnedIcon}{sharedIcon}{loadIcon}{nameIcon}
                   </div>;
            } else if (query.SharedBy) {
                const desc = query.Name
                    ? <span>
                        <b>{query.Name}</b>
                        &nbsp;<i>(Shared by {query.SharedBy})</i>
                      </span>
                    : <i>Query shared by {query.SharedBy}</i>;
                msg = <div>{desc}
                       &nbsp;{loadIcon}
                    </div>;
            } else {
                console.error('Invalid query. Neither shared nor recent');
            }

            return (<div key={idx} style={{
                    // border: 'thin solid black',
                    overflow: 'auto',
                }}>
                        {msg}
                        <div style={{display: 'flex', flexWrap: 'wrap'}}>
                        <div>
                            <h3>Fields</h3>
                            {query.fields.map(
                                (fieldobj, fidx) =>
                                        <div key={fidx} >
                                            <FieldDisplay
                                               fieldname={fieldobj.field}
                                               module={fieldobj.module}
                                               category={fieldobj.category}
                                               fulldictionary=
                                                {props.fulldictionary}
                                               mapModuleName=
                                                {props.mapModuleName}
                                               mapCategoryName=
                                                {props.mapCategoryName}
                                            />
                                        </div>
                            )}
                        </div>
                        {query.criteria ?
                        <div>
                            <h3>Filters</h3>
                            <QueryListCriteria
                                criteria={query.criteria}
                                fulldictionary={props.fulldictionary}
                                mapModuleName={props.mapModuleName}
                                mapCategoryName={props.mapCategoryName}
                            />
                        </div> : <div/>
                        }
                        </div>
                        <hr />
                    </div>);
           })
        }
    </div>);
}

/**
 * A single list item in a saved/shared query
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function QueryListCriteria(props) {
    if (!props.criteria || !props.criteria.group
            || props.criteria.group.length == 0) {
        return <i>(No filters for query)</i>;
    }
    return (<QueryTree items={props.criteria}
        activeGroup={''}
        buttonGroupStyle={{display: 'none'}}
        mapModuleName={props.mapModuleName}
        mapCategoryName={props.mapCategoryName}
        backgroundColour='rgb(240, 240, 240)'
        fulldictionary={props.fulldictionary}
    />);
}

export default Welcome;
