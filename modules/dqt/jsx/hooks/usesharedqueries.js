import {useState, useEffect} from 'react';
import swal from 'sweetalert2';

import {QueryGroup} from '../querydef';

/**
 * React hook for triggering toggling of pinned queries
 * on a LORIS server.
 *
 * @param {callback} onCompleteCallback - an action to perform after pinning
 * @return {array}
 */
function usePinnedQueries(onCompleteCallback) {
    const [pinQueryID, setPinQueryID] = useState(null);
    const [pinAction, setPinAction] = useState('pin');
    useEffect(() => {
        if (pinQueryID == null) {
            return;
        }

        fetch(
            '/dqt/queries/' + pinQueryID + '?pin=' + pinAction,
            {
                method: 'PATCH',
                credentials: 'same-origin',
            },
        ).then( () => {
            setPinQueryID(null);
            if (onCompleteCallback) {
                onCompleteCallback();
            }
        }
        );
    }, [pinQueryID, pinAction]);
    return [setPinQueryID, setPinAction];
}

/**
 * React hook for triggering toggling of shared queries
 * on a LORIS server.
 *
 * @param {callback} onCompleteCallback - an action to perform after pinning
 * @return {array}
 */
function useShareQueries(onCompleteCallback) {
    const [shareQueryID, setShareQueryID] = useState(null);
    const [shareAction, setShareAction] = useState('share');
    useEffect(() => {
        if (shareQueryID == null) {
            return;
        }

        fetch(
            '/dqt/queries/' + shareQueryID + '?share=' + shareAction,
            {
                method: 'PATCH',
                credentials: 'same-origin',
            },
        ).then( () => {
            setShareQueryID(null);
            if (onCompleteCallback) {
                onCompleteCallback();
            }
        }
        );
    }, [shareQueryID, shareAction]);
    return [setShareQueryID, setShareAction];
}

/**
 * React hook to load recent and shared queries from the server
 *
 * @return {array} - [{queries}, reload function(), {queryActions}]
 */
function useSharedQueries() {
    const [recentQueries, setRecentQueries] = useState([]);
    const [sharedQueries, setSharedQueries] = useState([]);
    const [topQueries, setTopQueries] = useState([]);


    const [loadQueriesForce, setLoadQueriesForce] = useState(0);
    const reloadQueries = () => setLoadQueriesForce(loadQueriesForce+1);
    const [setPinQueryID, setPinAction] = usePinnedQueries(reloadQueries);
    const [setShareQueryID, setShareAction] = useShareQueries(reloadQueries);

    useEffect(() => {
        fetch('/dqt/queries', {credentials: 'same-origin'})
        .then((resp) => {
          if (!resp.ok) {
            throw new Error('Invalid response');
          }
          return resp.json();
        }).then((result) => {
          let convertedrecent = [];
          let convertedshared = [];
          let convertedtop = [];
          if (result.recent) {
            result.recent.forEach( (query) => {
              if (query.Query.criteria) {
                query.Query.criteria = unserializeSavedQuery(
                  query.Query.criteria,
                );
              }
              convertedrecent.push({
                QueryID: query.QueryID,
                RunTime: query.RunTime,
                Pinned: query.Pinned,
                Shared: query.Shared,
                Name: query.Name,
                ...query.Query,
              });
            });
          }
          if (result.shared) {
            result.shared.forEach( (query) => {
              if (query.Query.criteria) {
                query.Query.criteria = unserializeSavedQuery(
                  query.Query.criteria,
                );
              }
              convertedshared.push({
                QueryID: query.QueryID,
                SharedBy: query.SharedBy,
                Name: query.Name,
                ...query.Query,
              });
            });
          }
          if (result.topqueries) {
            result.topqueries.forEach( (query) => {
              if (query.Query.criteria) {
                query.Query.criteria = unserializeSavedQuery(
                  query.Query.criteria,
                );
              }
              convertedtop.push({
                QueryID: query.QueryID,
                Name: query.Name,
                ...query.Query,
              });
            });
          }
          setRecentQueries(convertedrecent);
          setSharedQueries(convertedshared);
          setTopQueries(convertedtop);
    }).catch( (error) => {
      console.error(error);
    });
    }, [loadQueriesForce]);
    return [
        {
            recent: recentQueries,
            shared: sharedQueries,
            top_: topQueries,
        },
        reloadQueries,
        {
            pin: (queryID) => {
                    setPinAction('pin');
                    setPinQueryID(queryID);
            },
            unpin: (queryID) => {
                    setPinAction('unpin');
                    setPinQueryID(queryID);
            },

            share: (queryID) => {
                    setShareAction('share');
                    setShareQueryID(queryID);
            },
            unshare: (queryID) => {
                setShareAction('unshare');
                setShareQueryID(queryID);
            },
        },
    ];
}

/**
 * Takes a saved query from a JSON object and marshal
 * it into a QueryGroup object
 *
 * @param {object} query - the json object
 *
 * @return {QueryGroup}
 */
function unserializeSavedQuery(query) {
    if (!query.operator) {
        console.error('Invalid query tree', query);
        return null;
    }
    const root = new QueryGroup(query.operator);
    query.group.forEach((val) => {
        if (val.operator) {
            const childTree = unserializeSavedQuery(val);
            root.group.push(childTree);
            return;
        }
        if (!val.module
            || !val.category
            || !val.fieldname
            || !val.op) {
            console.error('Invalid criteria', val);
            return;
        }
        root.addTerm({
            Module: val.module,
            Category: val.category,
            Field: val.fieldname,
            Op: val.op,
            Value: val.value,
        });
    });
    return root;
}

/**
 * React hook to load a query if one was passed in the URL.
 *
 * @param {function} loadQuery - function to load the query into React state
 *
 */
function useLoadQueryFromURL(loadQuery) {
    // Load query if queryID was passed
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const queryID = params.get('queryID');
        if (!queryID) {
            return;
        }
        fetch(
            '/dqt/queries/' + queryID,
            {
                method: 'GET',
                credentials: 'same-origin',
            },
        ).then((resp) => {
                  if (!resp.ok) {
                      throw new Error('Invalid response');
                  }
                  return resp.json();
          }).then((result) => {
              if (result.criteria) {
                  result.criteria = unserializeSavedQuery(result.criteria);
              }
              loadQuery(result.fields, result.criteria);
              swal.fire({
                type: 'success',
                text: 'Loaded query',
              });
          }).catch( (error) => {
              swal.fire({
                  type: 'error',
                  text: 'Could not load query',
              });
              console.error(error);
          });
    }, []);
}


export {
    useSharedQueries,
    useLoadQueryFromURL,
};
