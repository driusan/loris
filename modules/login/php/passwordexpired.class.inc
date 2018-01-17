<?php
/**
 * Implements the ViewDetails subpage of the dicom_archive module.
 *
 * PHP version 5
 *
 * @category   Behavioural
 * @package    Main
 * @subpackage Imaging
 * @author     Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
*/
namespace LORIS\login;

/**
 * Implements the ViewDetails subpage of the dicom_archive module.
 *
 * @category   Behavioural
 * @package    Main
 * @subpackage Imaging
 * @author     Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
class PasswordExpired extends \NDB_Form
{
    /**
     * Determine whether the user has permission to view this page.
     * Unlike most pages in the login module, only authenticated
     * users have access to the password expiry page.
     *
     * @return bool whether the user has access
     */
    function _hasAccess()
    {
        $user = $_SESSION['State']->getProperty('login');
        if (empty($user)) {
            return false;
        }

        if ($user->isLoggedIn()) {
            return true;
        }
        return false;
    }

    function __construct()
    {
        header("Cache-Control: must-revalidate");
    }

    function commonPageSetup()
    {
        $this->addPassword("password", "", array("placeholder" => "New Password"));
        $this->addPassword("confirm", "", array("placeholder" => "Confirm password"));
    }

    function _validate($values)
    {
        error_log("validating");
        if ($values['password'] !== $values['confirm']) {
            error_log("failing");
            return array("password" => "Passwords do not match.");
        }
        error_log("passing");
        return true;
    }
}

