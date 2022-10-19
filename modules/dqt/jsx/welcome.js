import ExpansionPanels from './components/expansionpanels';
import swal from 'sweetalert2';
import FieldDisplay from './fielddisplay';
import {useEffect, useState} from 'react';
import QueryTree from './querytree';
import {QueryGroup} from './querydef';
import NameQueryModal from './welcome.namequerymodal';
import AdminQueryModal from './welcome.adminquerymodal';
import getDictionaryDescription from './getdictionarydescription';


/**
 * Return the welcome tab for the DQT
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function Welcome(props) {
    const panels = [];
    if (props.topQueries.length > 0) {
        panels.push({
            title: 'Study Queries',
            content: (
                <div>
                    <QueryList
                        queries={props.topQueries}
                        loadQuery={props.loadQuery}
                        defaultCollapsed={true}

                        getModuleFields={props.getModuleFields}
                        mapModuleName={props.mapModuleName}
                        mapCategoryName={props.mapCategoryName}
                        fulldictionary={props.fulldictionary}

                        queryAdmin={props.queryAdmin}
                        reloadQueries={props.reloadQueries}
                    />
                </div>
                ),
            alwaysOpen: false,
            defaultOpen: true,
        });
    }
    panels.push({
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
    });
    panels.push({
            title: 'Recent Queries',
            content: (
                <div>
                  <QueryList
                        queries={props.recentQueries}
                        loadQuery={props.loadQuery}
                        defaultCollapsed={false}

                        pinQuery={props.pinQuery}
                        unpinQuery={props.unpinQuery}

                        shareQuery={props.shareQuery}
                        unshareQuery={props.unshareQuery}

                        reloadQueries={props.reloadQueries}

                        getModuleFields={props.getModuleFields}
                        mapModuleName={props.mapModuleName}
                        mapCategoryName={props.mapCategoryName}
                        fulldictionary={props.fulldictionary}
                        queryAdmin={props.queryAdmin}
                    />
                </div>
              ),
            alwaysOpen: false,
            defaultOpen: true,
    });
    if (props.sharedQueries.length > 0) {
        panels.push({
              title: 'Shared Queries',
              content: (
                <div>
                  <QueryList
                    queries={props.sharedQueries}
                    loadQuery={props.loadQuery}
                    defaultCollapsed={true}

                    getModuleFields={props.getModuleFields}
                    mapModuleName={props.mapModuleName}
                    mapCategoryName={props.mapCategoryName}
                    fulldictionary={props.fulldictionary}

                    queryAdmin={props.queryAdmin}
                  />
                </div>
              ),
              alwaysOpen: false,
              defaultOpen: true,
        });
    }

    return (
        <div>
           <h1 style={{
             color: '#0a3572',
             textAlign: 'center',
             padding: '30px 0 0 0',
           }}>
               Welcome to the Data Query Tool
            </h1>
            <ExpansionPanels panels={panels} />
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
    const [adminModalID, setAdminModalID] = useState(null);
    const [queryName, setQueryName] = useState(null);
    const [defaultModalQueryName, setDefaultModalQueryName] = useState('');

    const [onlyStarred, setOnlyStarred] = useState(false);
    const [onlyShared, setOnlyShared] = useState(false);
    const [onlyNamed, setOnlyNamed] = useState(false);
    const [noDuplicates, setNoDuplicates] = useState(false);
    const [queryFilter, setQueryFilter] = useState('');
    const [fullQuery, setFullQuery] = useState(!props.defaultCollapsed);
    const [unpinAdminQuery, setUnpinAdminQuery] = useState(null);

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
        if (!nameModalID || !queryName) {
            return;
        }

        // Prevent re-triggering by resetting the state
        // before fetching, cache the values we need
        // to build the URI before setting
        const id = nameModalID;
        const name = queryName;

        setNameModalID(null);
        setQueryName(null);

        fetch(
            '/dqt/queries/' + id
                + '?name=' + encodeURIComponent(name),
            {
                method: 'PATCH',
                credentials: 'same-origin',
            },
        ).then((response) => {
            setQueryName(null);
            if (response.ok) {
                props.reloadQueries();
            }
        });
    }, [queryName]);

    useEffect(() => {
        if (!adminModalID || !queryName) {
            return;
        }

        // Prevent re-triggering by resetting the state
        // before fetching, cache the values we need
        // to build the URI before setting
        const id = adminModalID;
        const name = queryName;

        setAdminModalID(null);
        setQueryName(null);

        fetch(
            '/dqt/queries/' + id
                + '?type=top&name=' + encodeURIComponent(name),
            {
                method: 'PATCH',
                credentials: 'same-origin',
            },
        ).then((response) => {
            if (response.ok) {
                props.reloadQueries();
            }
        });
    }, [queryName]);

    useEffect(() => {
        if (!unpinAdminQuery) {
            return;
        }

        // Prevent re-triggering by resetting the state
        // before fetching, cache the values we need
        // to build the URI before setting
        const id = unpinAdminQuery;
        setUnpinAdminQuery(null);

        fetch(
            '/dqt/queries/' + id + '?type=untop',
            {
                method: 'PATCH',
                credentials: 'same-origin',
            },
        ).then((response) => {
            if (response.ok) {
                props.reloadQueries();
            }
        });
    }, [unpinAdminQuery]);

    const nameModal = nameModalID == null ? '' :
        <NameQueryModal
            onSubmit={(name) => setQueryName(name)}
            closeModal={() => setNameModalID(null)}
            defaultName={defaultModalQueryName}
            QueryID={nameModalID}
        />;
    const adminModal = adminModalID == null ? '' :
        <AdminQueryModal
            onSubmit={(name, topQ, dashboardQ) => setQueryName(name)}
            closeModal={() => setAdminModalID(null)}
            defaultName={defaultModalQueryName}
            QueryID={adminModalID}
        />;

    let displayedQueries = props.queries;
    if (onlyStarred === true) {
        displayedQueries = displayedQueries.filter(
            (val) => val.Pinned
        );
    }
    if (onlyShared === true) {
        displayedQueries = displayedQueries.filter(
            (val) => val.Shared
        );
    }
    if (onlyNamed === true) {
        displayedQueries = displayedQueries.filter(
            (val) => {
                if (val.Name || val.Name == '') {
                    return true;
                }
                return false;
            }
        );
    }
    if (noDuplicates === true) {
        let queryList = {};
        let newDisplayedQueries = [];
        displayedQueries.forEach((val) => {
            if (queryList.hasOwnProperty(val.QueryID)) {
                return;
            }
            queryList[val.QueryID] = val;
            newDisplayedQueries.push(val);
        });
        displayedQueries = newDisplayedQueries;
    }
    if (queryFilter != '') {
        displayedQueries = displayedQueries.filter(
            (val) => {
                const lowerQF = queryFilter.toLowerCase();
                const nameContains = val.Name
                    && val.Name.toLowerCase().includes(lowerQF);
                const runTimeContains = val.RunTime &&
                    val.RunTime.includes(lowerQF);
                const sharedByContains = val.SharedBy &&
                    val.SharedBy.toLowerCase().includes(lowerQF);
                let anyFieldMatches = false;
                let anyFilterMatches = false;
                if (val.fields) {
                    for (let field of val.fields) {
                        if (field.field.toLowerCase().includes(lowerQF)) {
                            anyFieldMatches = true;
                            break;
                        }
                        const description = getDictionaryDescription(
                            field.module,
                            field.category,
                            field.field,
                            props.fulldictionary,
                        );
                        if (description.toLowerCase().includes(lowerQF)) {
                            anyFieldMatches = true;
                            break;
                        }
                    }
                }
                if (val.criteria) {
                    const itemInGroupMatches = (group) => {
                        for (let field of group.group) {
                            if (field.fieldname.toLowerCase().includes(
                                lowerQF
                            )) {
                                anyFieldMatches = true;
                                return;
                            }
                            const description = getDictionaryDescription(
                                field.module,
                                field.category,
                                field.fieldname,
                                props.fulldictionary,
                            );
                            if (description.toLowerCase().includes(lowerQF)) {
                                anyFilterMatches = true;
                                return;
                            }
                        }
                    };
                    itemInGroupMatches(val.criteria);
                }
                return nameContains
                    || runTimeContains
                    || sharedByContains
                    || anyFieldMatches
                    || anyFilterMatches;
                });
    }
    const starFilter = props.pinQuery ?
            <CheckboxElement name='onlystar' label='Starred Only'
                value={onlyStarred}
                offset=''
                onUserInput={
                   (name, value) => setOnlyStarred(value)
                }/> : <span />;
    const shareFilter = props.shareQuery ?
            <CheckboxElement name='onlyshare' label='Shared Only'
                value={onlyShared}
                offset=''
                onUserInput={
                   (name, value) => setOnlyShared(value)
                }/>
                : <span />;
    // Use whether shareQuery prop is defined as proxy
    // to determine if this is a shared query or a recent
    // query list
    const duplicateFilter = props.shareQuery ?
            <CheckboxElement name='noduplicate'
                label='No run times (eliminate duplicates)'
                value={noDuplicates}
                offset=''
                onUserInput={
                   (name, value) => setNoDuplicates(value)
                }/>
                : <span />;
    return (<div>
        {nameModal}
        {adminModal}
        <div style={{
            borderBottom: 'thin solid black',
            marginBottom: '1em',
            paddingBottom: '1ex',
        }}>
            <TextboxElement name='filter'
                label='Filter'
                value={queryFilter}
                onUserInput={
                   (name, value) => setQueryFilter(value)
                }/>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}>
                    {starFilter}
                    {shareFilter}
                    <CheckboxElement name='onlynamed' label='Named Only'
                        value={onlyNamed}
                        offset=''
                        onUserInput={
                           (name, value) => setOnlyNamed(value)
                        }/>
                    {duplicateFilter}
                    <CheckboxElement name='fullquery' label='Collapse queries'
                        value={!fullQuery}
                        offset=''
                        onUserInput={
                           (name, value) => setFullQuery(!value)
                        }/>
                </div>
        </div>
        <Pager>
            {displayedQueries.map((query, idx) => {
                return <SingleQueryDisplay key={idx} query={query}
                            includeRuns={!noDuplicates}
                            showFullQueryDefault={fullQuery}
                            mapCategoryName={props.mapCategoryName}
                            mapModuleName={props.mapModuleName}

                            loadQuery={props.loadQuery}

                            pinQuery={props.pinQuery}
                            unpinQuery={props.unpinQuery}

                            shareQuery={props.shareQuery}
                            unshareQuery={props.unshareQuery}

                            setNameModalID={setNameModalID}
                            setDefaultModalQueryName={setDefaultModalQueryName}
                            setAdminModalID={setAdminModalID}

                            queryAdmin={props.queryAdmin}
                            unpinAdminQuery={setUnpinAdminQuery}
                            />;
            })}
        </Pager>
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

/**
 * Paginate the results
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function Pager(props) {
    const [pageNum, setPageNum] = useState(1);
    const rowsPerPage = 5;

    const start = (pageNum-1)*rowsPerPage;
    const end = (pageNum)*rowsPerPage;
    const displayedRange = props.children.slice(start, end);
    return <div>
              <PaginationLinks
                Total={props.children.length}
                onChangePage={setPageNum}
                RowsPerPage={rowsPerPage}
                Active={pageNum}
              />
              {displayedRange}
              <PaginationLinks
                Total={props.children.length}
                onChangePage={setPageNum}
                RowsPerPage={rowsPerPage}
                Active={pageNum}
              />
      </div>;
}

/**
 * Display a single query in a QueryList
 *
 * @param {object} props - React props
 *
 * @return {ReactDOM}
 */
function SingleQueryDisplay(props) {
    const [showFullQuery, setShowFullQuery] =
        useState(props.showFullQueryDefault);
    // Reset the collapsed state if the checkbox gets toggled
    useEffect(() => {
        setShowFullQuery(props.showFullQueryDefault);
    }, [props.showFullQueryDefault]);

    let pinnedIcon;
    let sharedIcon;
    const query = props.query;

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

    const pinIcon = props.queryAdmin
        ? <span title="Pin Study Query"
            style={{cursor: 'pointer'}}
            className="fa-stack"
            onClick={() => {
                props.setDefaultModalQueryName(query.Name);
                props.setAdminModalID(query.QueryID);
                }
            }>
               <i className="fas fa-thumbtack fa-stack-1x"> </i>
           </span>
       : <div />;

     let msg = '';
     if (query.RunTime) {
         let desc = query.Name
             ? <span>
             <b>{query.Name}</b>
             &nbsp;<i>(Run at {query.RunTime})</i>
             </span>
             : <i>You ran this query at {query.RunTime}</i>;
         if (!props.includeRuns) {
             desc = query.Name
                 ? <span>
                 <b>{query.Name}</b>
                 </span>
                 : <i>You ran this query</i>;
         }

         const nameIcon = <span title="Name query"
             style={{cursor: 'pointer'}}
             className="fa-stack"
             onClick={() => {
                props.setDefaultModalQueryName(query.Name);
                props.setNameModalID(query.QueryID);
             }}>
                <i className="fas fa-pencil-alt fa-stack-1x"> </i>
            </span>;
         msg = <div>{desc}
            &nbsp;{pinnedIcon}{sharedIcon}{loadIcon}{nameIcon}{pinIcon}
            </div>;
     } else if (query.SharedBy) {
         const desc = query.Name
            ? <span>
                <b>{query.Name}</b>
                &nbsp;<i>(Shared by {query.SharedBy})</i>
              </span>
            : <i>Query shared by {query.SharedBy}</i>;
         msg = <div>{desc}
             &nbsp;{loadIcon}{pinIcon}
             </div>;
     } else if (query.Name) {
         const unpinIcon = props.queryAdmin
             ? <span title="Name query"
                 style={{cursor: 'pointer'}}
            className="fa-stack"
            onClick={() => {
                props.unpinAdminQuery(query.QueryID);
                }
            }>
               <i className="fas fa-slash fa-stack-1x"></i>
               <i className="fas fa-thumbtack fa-stack-1x"> </i>
           </span>
       : <div />;
         msg = <div><b>{query.Name}</b>&nbsp;{loadIcon}{unpinIcon}</div>;
     } else {
         console.error('Invalid query. Neither shared nor recent');
     }

     const queryDisplay = !showFullQuery ? <div /> :
         <div style={{display: 'flex', flexWrap: 'wrap'}}>
             <div>
                 <h3>Fields</h3>
                 {query.fields.map(
                         (fieldobj, fidx) =>
                         <FieldDisplay
                         key={fidx}
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
                 </div>
             : <div/>
             }
     </div>;
     const expandIcon = <i style={{
            paddingRight: '1ex',
            cursor: 'pointer',
         }}
         className={'fas fa-chevron-' + (showFullQuery ? 'down' : 'right')}
         onClick={() => setShowFullQuery(!showFullQuery)}
      ></i>;
     return (<div style={{
                // border: 'thin solid black',
                overflow: 'auto',
                }}
            >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'start',
            }}>
                {expandIcon}
                {msg}
            </div>
            {queryDisplay}
            <hr />
        </div>);
}
export default Welcome;
