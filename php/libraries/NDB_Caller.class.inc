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
require_once 'PEAR.php';
require_once 'User.class.inc';
require_once 'NDB_Menu.class.inc';

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
class NDB_Caller extends PEAR
{
    /**
     * Identifies what type of script is being run (menu, form or instrument)
     * @var    string
     */
    var $type;

    /**
     * Determines how data entry is being performed (directly from a study
     * participant, or by a data entry staff.)
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
        //throw new LorisException("NDB_Caller::singleton() is deprecated, use NDB_Factory instead");
    }

    /**
    * Renders the called menu, form or the instrument into html
    *
    * @param string $test_name The object type to load.  The test_name of the
    *                          menu, form or instrument
    * @param string $subtest   The subtest.  The page of the form or instrument.
    * @param string $CommentID The commentid being loaded.
    * @param string $nextpage  A page to forward to on completion of save.
    *                          Used in direct data entry.
    *
    * @return string rendered object, as html
    */
    function load($test_name, $subtest, $CommentID = '', $nextpage=null)
    {
        $config = NDB_Config::singleton();
        // if no first argument, return
        if (empty($test_name)) {
            return;
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST'
            && isset($_POST['login'])
        ) {
            header("HTTP/1.1 303 See Other");
             $url  = $config->getSetting('url');
             $url .= Utility::removeCommonAffix($url, $_SERVER['REQUEST_URI']);
             // sending user to the url that was requested
             header("Location: $url");
        }
        if (empty($CommentID) && isset($_REQUEST['commentID'])) {
            $CommentID = $_REQUEST['commentID'];
        }
        // get the files path, aka the base directory
        $base = $config->getSetting('base');

        if (is_dir($base . "modules/$test_name")) {
            // New module style
            // Only supports Menu_Filters and Forms.
            // Modules can not have instruments or reliability.
            set_include_path(
                $base . "project/libraries:"
                . $base . "modules/$test_name:"
                . $base . "modules/$test_name/php:"
                . get_include_path()
            );

            $submenu = null;
            if (!empty($_REQUEST['submenu'])) {
                $submenu = $_REQUEST['submenu'];
                $subtest = $submenu;
            }

            $menu_filter_testname = "NDB_Menu_Filter_$test_name.class.inc";
            $menu_form_testname   = "NDB_Menu_Filter_Form_$test_name.class.inc";
            $menu_testname        = "NDB_Menu_$test_name.class.inc";

            $menu_filter_form_subtest = "NDB_Menu_Filter_Form_$submenu.class.inc";

            if (((empty($subtest)
                && $submenu === null)
                && ($this->existsAndRequire($menu_filter_testname)
                || $this->existsAndRequire($menu_form_testname)
                || $this->existsAndRequire($menu_testname))) || ($submenu !== null
                && ($this->existsAndRequire("NDB_Menu_Filter_$submenu.class.inc")
                || $this->existsAndRequire("NDB_Menu_$submenu.class.inc")
                || $this->existsAndRequire($menu_filter_form_subtest)))
            ) {
                // No subtest, load the menu

                $mode = isset($_REQUEST['mode']) ? $_REQUEST['mode'] : '';
                if ($submenu !== null) {
                    $page = $this->loadMenu($submenu, $mode);
                } else {
                    $page = $this->loadMenu($test_name, $mode);
                }
            } else if ($this->existsAndRequire("NDB_Form_$test_name.class.inc")) {
                $identifier = isset($_REQUEST['identifier'])
                    ? $_REQUEST['identifier']
                    : '';
                $page = $this->loadForm($test_name, $subtest, $identifier);
            }

            if (method_exists($page , 'save') && $_SERVER['REQUEST_METHOD'] === 'POST') {
                $success = $page->save();
            }
            if (method_exists($page, 'getControlPanel')) {
                $this->controlPanel = $page->getControlPanel();
            }
            return $page->display();
        }
        // it is nothing!
        throw new LorisException("This page ($test_name) is under construction.", 404);
    }

    /**
    * Renders html for a Menu
    *
    * @param string $menu The Menu being loaded
    * @param string $mode The Menu mode
    *
    * @return NDB_Menu for the menu to display.
    */
    function loadMenu($menu, $mode)
    {
        // make an instance of the menu's object
        $menu =& NDB_Menu::factory($menu, $mode);

        $success = $menu->setup();
        return $menu;
    }

    /**
    * Renders html for a Form
    *
    * @param string $class      The Form to load
    * @param string $page       The page of the Form to load
    * @param string $identifier The identifier of the Form
    *
    * @return NDB_Form for the page to load
    */
    function loadForm($class, $page, $identifier)
    {
        // make an instance of the form's object
        return NDB_Form::factory($class, $page, $identifier);
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
        $form = NDB_Reliability::factory(
            $class,
            $page,
            $identifier,
            $reliability_center_id
        );

        return $form;
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
    * @return NDB_BVL_Instrument of the page
    */
    function loadInstrument(
        $instrumentName,
        $page,
        $commentID,
        $redirectToOnSuccess=null
    ) {
        if ($page === 'finalpage') {
            $instrument =& NDB_BVL_Instrument::factory(
                $instrumentName,
                $commentID,
                $page
            );

            $this->instrument = $instrument;
            return "<script language='javascript'>"
                . "window.location='$redirectToOnSuccess'"
                . "</script>";
        }
        $user =& User::singleton();

        if ($_REQUEST['sessionID']) {
            $timepoint =& TimePoint::singleton($_REQUEST['sessionID']);
        }

        // make an instance of the instrument's object
        $instrument =& NDB_BVL_Instrument::factory(
            $instrumentName,
            $commentID,
            $page
        );

        if ($redirectToOnSuccess !== null && $success !== false) {
            return "<script language='javascript'>"
                .   "window.location='$redirectToOnSuccess'"
                . "</script>";
        }
        // freeze the form to prevent data entry
        if ($status->getDataEntryStatus() != 'In Progress'
            || !$user->hasPermission('data_entry')
            || $user->getData("CenterID") != $timepoint->getData("CenterID")
        ) {
            if ($instrument->preview !== true && $this->DataEntry !== 'Direct') {
                $instrument->freeze();
            }
        }
        $status  = new NDB_BVL_InstrumentStatus;
        $success = $status->select($commentID);
        return $instrument;
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
