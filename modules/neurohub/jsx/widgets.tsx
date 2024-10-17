import {useState, useEffect} from 'react'

/**
 * Implements a User Preference widget for the Neurohub module
 *
 * @returns {React.ReactElement} - The widget
 */
export function NeurohubTokenPreference() {
     const [token, setToken] = useState(null);
     useEffect( () => {
	     fetch('/neurohub/token')
	     .then( (response) => response.json())
	     .then( (value) => {
		     setToken(value.token);
	     });
     }, []);
     return (
        <div className="row form-group">
          <label className="col-sm-2">Neurohub API token:</label>
          <div className="col-sm-10">
              <input name="neurohubtoken" className="form-control input-sm" type="text" id="neurohubtoken" />
          </div>
        </div>
     );
}
