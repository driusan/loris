<?php
namespace LORIS\instruments;
use \LORIS\Data\Dictionary\Category;
use \LORIS\Data\Dictionary\DictionaryItem;

/**
 * Implement a QueryEngine for LORIS instruments.
 *
 * @license http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class InstrumentQueryEngine implements \LORIS\Data\Query\QueryEngine
{
    protected $loris;

    /**
     * Construct an InstrumentQueryEngine
     *
     * @param \LORIS\LorisInstance $loris The LORIS instance being queried
     */
    public function __construct(\LORIS\LorisInstance $loris)
    {
        $this->loris = $loris;
    }
    /**
     * Return the data dictionary for all instruments installed on a LORIS
     * instance.
     *
     * @return \LORIS\Data\Dictionary\Category[]
     */
    public function getDataDictionary() : iterable
    {
        $DB = $this->loris->getDatabaseConnection();

        $rows = $DB->pselectCol("SELECT Test_name FROM test_names", []);

        $dict = [];
        foreach ($rows as $testname) {
            try {
                $inst   = \NDB_BVL_Instrument::factory(
                    $this->loris,
                    $testname,
                    "",
                    ""
                );
                $cat    = new \LORIS\Data\Dictionary\Category(
                    $testname,
                    $inst->getFullName()
                );
                $fields = $inst->getDataDictionary();
                $dict[] = $cat->withItems($fields);
            } catch (\LorisException $e) {
                error_log($e);
            } catch (\NotFound $e) {
                error_log($e);
            }
        }
        return $dict;
    }

    /**
     * {@inheritDoc}
     *
     * @param Category       $inst The category containing the DictionaryItem.
     * @param DictionaryItem $item The item we want visit lists for.
     *
     * @return iterable
     */
    public function getVisitList(
        \LORIS\Data\Dictionary\Category $inst,
        \LORIS\Data\Dictionary\DictionaryItem $item
    ) : iterable {
        if ($item->getScope()->__toString() !== 'session') {
            return [];
        }

        $DB     = \NDB_Factory::singleton()->database();
        $visits = $DB->pselectCol(
            "SELECT DISTINCT s.Visit_Label
             FROM flag f
                JOIN session s ON (f.SessionID=s.ID)
                JOIN candidate c ON (c.CandID=s.CandID)
             WHERE s.Active='Y' AND c.Active='Y' and f.Test_name=:tn
             ORDER BY s.Visit_label",
            ['tn' => $inst->getName()]
        );

        return $visits;
    }
}
