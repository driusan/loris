<?php
/**
 * This serves as a hint to LORIS that this module is a real module.
 * It does nothing but implement the module class in the module's namespace.
 *
 * PHP Version 5
 *
 * @category   Behavioural
 * @package    Main
 * @subpackage Query
 * @author     Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris-Trunk/
 */
namespace LORIS\dqt;

/**
 * Class module implements the basic LORIS module functionality
 *
 * @category   Behavioural
 * @package    Main
 * @subpackage Query
 * @author     Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris-Trunk/
 */
class Module extends \Module
{
    /**
     * {@inheritDoc}
     *
     * @param \User $user The user whose access is being checked.
     *
     * @return bool whether access is granted
     */
    public function hasAccess(\User $user) : bool
    {
        return true;
        return parent::hasAccess($user) && $user->hasPermission('dataquery_view');
    }

    /**
     * {@inheritDoc}
     *
     * @return string The menu category for this module
     */
    public function getMenuCategory() : string
    {
        return "Reports";
    }

    /**
     * {@inheritDoc}
     *
     * @return string The human readable name for this module
     */
    public function getLongName() : string
    {
        return "Data Query Tool (Alpha)";
    }

    /**
     * {@inheritDoc}
     *
     * @param string $type    The type of widgets to get.
     * @param \User  $user    The user widgets are being retrieved for.
     * @param array  $options A type dependent list of options to provide
     *                        to the widget.
     *
     * @return \LORIS\GUI\Widget[]
     */
    public function getWidgets(string $type, \User $user, array $options)
    {
        switch ($type) {
        case 'dashboard':
            $baseURL = \NDB_Factory::singleton()->settings()->getBaseURL();
            $DB = $this->lorisinstance->getDatabaseConnection();
            $provisioner = (
                new Provisioners\StarredQueries($this->lorisinstance, $user)
            )->filter(
                    new \LORIS\Data\Filters\AccessibleResourceFilter()
            );
            $results = $provisioner->execute($user);
            $starredqueries = [];
            foreach($results as $query) {
                $starredqueries[] = $query;
            }
            $widgets = [];
            if (count($starredqueries) > 0) {
                $widgets[] = new \LORIS\dashboard\Widget(
                    new \LORIS\dashboard\WidgetContent(
                        "Starred Queries",
                        $this->renderTemplate(
                            "starredwidget.tpl",
                            [
                                'baseURL'       => $baseURL,
                                'starredqueries' => $starredqueries,
                            ]
                        ),
                        ""
                    ),
                    new \LORIS\dashboard\WidgetDisplayProps("small"),
                );
            }
            $provisioner = (
                new Provisioners\StudyQueries($this->lorisinstance, 'dashboard')
            )->filter(
                    new \LORIS\Data\Filters\AccessibleResourceFilter()
            );
        
            $results = $provisioner->execute($user);
            $studyqueries = [];
            foreach($results as $query) {
                $studyqueries[] = $query;
                
            }
            if (count($studyqueries) > 0) {
                $widgets[] = new \LORIS\dashboard\Widget(
                    new \LORIS\dashboard\WidgetContent(
                        "Study Queries",
                        $this->renderTemplate(
                            "studyquerieswidget.tpl",
                            [
                                'baseURL'       => $baseURL,
                                'queries' => $studyqueries,
                            ]
                        ),
                        ""
                    ),
                    new \LORIS\dashboard\WidgetDisplayProps("small"),
                );
            }
            return $widgets;
        }
        return [];
    }
}
