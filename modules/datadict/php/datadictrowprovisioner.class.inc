<?php declare(strict_types=1);
/**
 * This file implements a data provisioner to get all possible rows
 * for the datadict menu page.
 *
 * PHP Version 7
 *
 * @category   Behavioural
 * @package    Main
 * @subpackage Behavioural
 * @author     Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */

namespace LORIS\datadict;

/**
 * This class implements a data provisioner to get all possible rows
 * for the datadict menu page.
 *
 * PHP Version 7
 *
 * @category   Behavioural
 * @package    Main
 * @subpackage Behavioural
 * @author     Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
class DataDictRowProvisioner extends \LORIS\Data\Provisioners\DBRowProvisioner
{
    /**
     * Create a DataDictRowProvisioner, which gets rows for
     * the datadict menu table.
     */
    function __construct()
    {
        parent::__construct(
            "SELECT DISTINCT
                pt.sourceFrom as source_from,
                pt.name as name,
                pt.sourceField as source_field,
                coalesce(pto.description,pt.description) as description,
                CASE
                    WHEN COALESCE(pto.description,pt.description) = '' THEN 'Empty'
                    WHEN pto.name IS NOT NULL THEN 'Modified'
                    WHEN pto.name IS NULL THEN 'Unchanged'
                END as description_status
            FROM parameter_type pt
            LEFT JOIN parameter_type_override pto USING (Name)
            WHERE pt.Queryable=1
            ",
            []
        );

        foreach ($modules as $module) {
            $mdict = $module->getDataDictionary($this->loris);
            foreach($mdict as $cat) {
                foreach($cat->getItems() as $item) {
                    $name   = $cat->getName() . '_' . $item->getName();
                    $desc   = '';
                    $status = 'Unchanged';
                    if (isset($overrides[$name])) {
                        $desc   = $overrides[$name]['Description'];
                        $status = 'Modified';
                    } else {
                        $desc = $item->getDescription();
                    }

                    if ($desc == '') {
                        $status = 'Empty';
                    }
                    $dict[] = $this->getInstance(
                        $item,
                        [
                            'module'        => $module->getName(),
                            'category'     => $cat->getName(),
                            'name'               => $name,
                            'source_field'       => $item->getName(),
                            'description'        => $desc,
                            'description_status' => $status,
                            'datascope' => $item->getScope(),
                            'type' => $item->getDataType(),
                        ]
                    );
                }
            } 
        }
        return new \ArrayIterator($dict);
    }

    /**
     * Returns an instance of a DataDict object for a given
     * table row.
     *
     * @param array $row The database row from the LORIS Database class.
     *
     * @return \LORIS\Data\DataInstance An instance representing this row.
     */
    public function getInstance(\LORIS\Data\Dictionary\DictionaryItem $item, array $row) : \LORIS\Data\DataInstance
    {
        return new DataDictRow($item, $row);
    }
}
