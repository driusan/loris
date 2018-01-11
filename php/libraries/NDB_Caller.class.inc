<?php
/**
 * Contains NDB_Caller class to dispatch to the appropriate library
 * for the URL being loaded.
 *
 * PHP Version 5
 *
 * @category Main
 * @package  Main
 * @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
*/

/**
 * Caller class
 *
 * Dispatches to the right library to return HTML for the type of page being
 * loaded.
 *
 * @category Main
 * @package  Main
 * @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
class NDB_Caller
{
    /**
     * Identifies what type of script is being run (menu, form or instrument)
     *
     * @var string
     */
    var $type;

    /**
     * Determines how data entry is being performed (directly from a study
     * participant, or by a data entry staff.)
     *
     * @var string
     */
    var $DataEntry;

    /**
     * The NDB_BVL_Instrument instantiation of the instrument which was loaded.
     */
    var $instrument;

    /**
     * Singleton method
     *
     * @return NDB_Caller
     * @access public
     * @static
     */
    static function &singleton()
    {
        static $instance;
        if (is_null($instance)) {
            $instance = new NDB_Caller();
        }
        return $instance;
    }

    /**
     * Renders html for a Reliability Form
     *
     * @param string $class                 The Form to load
     * @param string $page                  The page of the Form to load
     * @param string $identifier            The identifier of the Form
     * @param string $reliability_center_id The id of the center at which the
     *                                      reliability test is being performed.
     *
     * @return string HTML to render to browser
     */
    function loadReliability($class, $page, $identifier, $reliability_center_id)
    {
        // make an instance of the form's object
        $form = NDB_Reliability::reliabilityfactory(
            $class,
            $page,
            $identifier,
            $reliability_center_id
        );

        $form->save();

        $this->page = $form;
        $html       = $form->display();

        return $html;
    }

    /**
    * Renders html for a quickform Instrument
    *
    * @param string $instrumentName      Name of the instrument to load
    * @param string $page                Page (subtest) of the instrument
    * @param string $commentID           CommentID of the instrument to load
    * @param string $redirectToOnSuccess URL to redirect to if the page is loaded
    *                                    successfully.
    *
    * @return string HTML of the page to render.
    */
    function loadInstrument(
        $instrumentName,
        $page,
        $commentID,
        $redirectToOnSuccess=null
    ) {
        if ($page === 'finalpage') {
            $instrument = NDB_BVL_Instrument::factory(
                $instrumentName,
                $commentID,
                $page
            );

            $this->instrument = $instrument;
            header("Location: $redirectToOnSuccess");
            return "";
        }
        $user = User::singleton();

        if ($_REQUEST['sessionID']) {
            $timepoint =& TimePoint::singleton($_REQUEST['sessionID']);
        }

        // make an instance of the instrument's object
        $instrument = NDB_BVL_Instrument::factory(
            $instrumentName,
            $commentID,
            $page
        );

        $this->instrument = $instrument;

        // save instrument form data
        $success = $instrument->save();

        if ($redirectToOnSuccess !== null && $success !== false) {
            header("Location: $redirectToOnSuccess");
            return "";
        }
        // create an instrument status object
        $status  = new NDB_BVL_InstrumentStatus;
        $success = $status->select($commentID);

        // freeze the form to prevent data entry
        if ($status->getDataEntryStatus() != 'In Progress'
            || !$user->hasPermission('data_entry')
            || !in_array(
                $timepoint->getData("CenterID"),
                $user->getData("CenterIDs")
            )
        ) {
            if ($instrument->preview !== true && $this->DataEntry !== 'Direct') {
                $instrument->freeze();
            }
        }

        $this->page = $instrument;
        $html       = $instrument->displayUserPage($user, $_GET, $_POST);
        return $html;
    }

    /**
     * Checks if a library exists, and requires it if it does.
     *
     * @param string $library name of class to be included.
     *
     * @return bool true if file exists, otherwise false
     */
    function existsAndRequire($library)
    {
        if (stream_resolve_include_path($library) !== false) {
            include_once $library;
            return true;
        }

        return false;
    }

    /**
     * Sets the data entry type being performed.
     *
     * @param string $type "normal" or "direct", the type of data entry
     *                     being performed.
     *
     * @return none
     */
    function setDataEntryType($type)
    {
        $this->DataEntry = $type;
    }
}
?>
