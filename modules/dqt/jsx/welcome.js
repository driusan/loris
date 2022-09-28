import ExpansionPanels from './components/expansionpanels';
import swal from 'sweetalert2';
import FieldDisplay from './fielddisplay';
import {useEffect} from 'react';
import QueryTree from './querytree';
import {QueryGroup} from './querydef';


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
                        </div>
                      ),
                      alwaysOpen: true,
                    },
                    {
                      title: 'Recent and Shared Queries',
                      content: (
                        <div>
                          <QueryList
                                queries={props.savedQueries}
                                loadQuery={props.loadQuery}

                                getModuleFields={props.getModuleFields}
                                mapModuleName={props.mapModuleName}
                                mapCategoryName={props.mapCategoryName}
                                fulldictionary={props.fulldictionary}
                            />
                        </div>
                      ),
                      alwaysOpen: true,
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
    return (<table style={{width: '100%'}}
        className="table table-hover table-primary table-bordered">
        <thead>
            <tr>
                <th>Fields</th>
                <th>Filters</th>
                <th>Time Run</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
        {props.queries.map((query, idx) => {
                        return (<tr key={idx}
                                onClick={() => {
                                    props.loadQuery(
                                        query.fields,
                                        query.criteria,
                                    );
                                    swal.fire({
                                        type: 'success',
                                        title: 'Query Loaded',
                                        text: 'Successfully loaded query.',
                                    });
                                }}
                            >
                            <td style={{verticalAlign: 'middle'}}>
                                {query.fields.map(
                                    (fieldobj, fidx) => <FieldDisplay
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
                                    )
                                }
                            </td>
                            <td style={{
                                textAlign: 'center',
                                verticalAlign: 'middle',
                            }}>
                                <QueryListCriteria
                                    criteria={query.criteria}
                                    fulldictionary={props.fulldictionary}
                                    mapModuleName={props.mapModuleName}
                                    mapCategoryName={props.mapCategoryName}
                                />
                            </td>
                            <td>2022-09-26 4:30pm</td>
                            <td>
                                <div>
                                    <i className="far fa-star" />
                                    <i className="fas fa-share-alt" />
                                </div>
                            </td>
                        </tr>);
        })}
        </tbody>
    </table>);
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
