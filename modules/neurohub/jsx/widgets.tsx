/**
 * Callback for clicking the NeuroHub button in the dataquery widget
 */
export function NeurohubDataqueryCallback() {
    // console.log('Clicked!');
}

/**
 * Implements a User Preference widget for the Neurohub module
 *
 * @returns {React.ReactElement} - The widget
 */
export function NeurohubTokenPreference() {
     return (<form>
         <label htmlFor="neurohubtoken">Neurohub API token:</label>
         <input type="text" id="neurohubtoken" />
     </form>);
}
