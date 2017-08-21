<?php
/**
* The candidate list menu
*
* PHP Version 5
*
* @category Main
* @package  Candidate_List
* @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
* @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
* @link     https://www.github.com/aces/Loris/
*/

namespace LORIS\candidate_list;

/**
 * Implements the candidate_list menu
 *
* @category Main
* @package  Candidate_List
* @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
* @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
* @link     https://www.github.com/aces/Loris/
 */
class candidate_List extends \NDB_Menu_Filter
{
    protected $table;
    var $AjaxModule = true;

    /**
     * Overloading this method to allow access to site users (their own site only)
     * and users w/ multisite privs
     *
     * @return true if user has access, false otherwise
     */
    function _hasAccess()
    {
        // create user object
        $user     =& \User::singleton();
        $site_arr = $user->getData('CenterIDs');
        foreach ($site_arr as $key=>$val) {
            $site[$key]        = & \Site::singleton($val);
            $isStudySite[$key] = $site[$key]->isStudySite();
        }
        $oneIsStudySite = in_array("1", $isStudySite);
        $aap            = $user->hasPermission('access_all_profiles');
        $this->tpl_data['access_all_profiles'] = $aap;
        return (
            $user->hasPermission('access_all_profiles')
            || ($oneIsStudySite && $user->hasPermission('data_entry'))

        );
    }

    function setup() {
            // Sets up LorisForm, etc.
          $this->_setupPage($this->menu, null, null, null, 'filter');

          $provisioner = new CandidateListRowProvisioner();

          $user     =& \User::singleton();
          if ($user->hasPermission("access_all_profiles") == false) {
                 $provisioner = $provisioner->Filter(new \LORIS\Data\Filters\SiteMatch());
          }

          $this->table = (new \LORIS\Data\Table())
            ->WithDataFrom($provisioner);

    }

   public function toArray() {
        $d = $this->table->toArray(\User::singleton());
        return [
            'Headers' => [
                'Site', 'DCCID', 'PSCID', 'Gender', 'Entity Type', 'Participant Status',
                'Subproject', 'DoB', 'Scan Done', 'Visit Count', 'Latest Visit Status', 'Feedback'],
                'Data' => array_map(function($row) {
                       return array_values($row);
                }, $d),
        ];
    }

    /**
     * Include the column formatter required to display the feedback link colours
     * in the candidate_list menu
     *
     * @return array of javascript to be inserted
     */
    function getJSDependencies()
    {
        $factory = \NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
        $deps    = parent::getJSDependencies();
        return array_merge(
            $deps,
            array(
             $baseURL . "/js/advancedMenu.js",
             $baseURL . "/candidate_list/js/columnFormatter.js",
             $baseURL . "/candidate_list/js/candidate_list_helper.js",
            )
        );
    }
}
?>
