import {createRoot} from 'react-dom/client';

/**
 * Index for the module
 *
 * @returns {React.ReactElement} - The main page
 */
function Index() : React.ReactElement {
    return <div>Welcome to neurohub!</div>;
}
declare const loris: any;
window.addEventListener('load', () => {
    const element = document.getElementById('lorisworkspace');
    if (!element) {
        throw new Error('Missing lorisworkspace');
    }
    const root = createRoot(element);

    root.render(
      <Index BaseURL={loris.BaseURL} />
    );
});
