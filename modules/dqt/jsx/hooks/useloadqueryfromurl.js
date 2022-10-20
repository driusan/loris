import {useEffect} from 'react';
import swal from 'sweetalert2';

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

export default useLoadQueryFromURL;
