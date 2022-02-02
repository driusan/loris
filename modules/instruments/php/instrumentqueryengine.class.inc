<?php
/**
 * This serves as a hint to LORIS that this module is a real module.
 * It does nothing but implement the module class in the module's namespace.
 *
 * PHP Version 7
 *
 * @category   Behavioural
 * @package    Main
 * @subpackage Imaging
 * @author     Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris-Trunk/
 */
namespace LORIS\instruments;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use LORIS\StudyEntities\Candidate\CandID;

/**
 * Class module implements the basic LORIS module functionality
 *
 * @category   Behavioural
 * @package    Main
 * @subpackage Imaging
 * @author     Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris-Trunk/
 */
class InstrumentQueryEngine implements \LORIS\Data\Query\QueryEngine
{
    protected $loris;

    public function __construct(\LORIS\LorisInstance $loris) {
        $this->loris = $loris;
    }
    /**
     * Return the data dictionary for all instruments installed on a LORIS
     * instance.
     *
     * @param \LORIS\LorisInstance $loris The loris instance whose dictionary
     *                                    should be retrieved
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
                $inst   = \NDB_BVL_Instrument::factory($this->loris, $testname, "", "");
                $cat    = new \LORIS\Data\Dictionary\Category(
                    $testname,
                    $inst->getFullName()
                );
                $fields = $inst->getDataDictionary();
                $dict[] = $cat->withItems($fields);
            } catch (\LorisException $e) {
                error_log($e);
            }
        }
        return $dict;
    }

    public function getCandidateMatches(\LORIS\Data\Query\QueryTerm $term, ?array $visitlist=null) : iterable {
        // This is stupid, but the parameter_type_override table uses '_' as a delimiter 
        // between instrument and fieldname, despite the fact that either one may itself
        // have a _ in the name. This can't be easily changed without losing all
        // existing overrides from the old datadict module.
        //
        // We walk the existing test names ordered by length to look for the longest prefix
        // match to find out what the instrument for the fieldname is.
        $DB = \Database::singleton();
        $rows = $DB->pselectCol("SELECT Test_name FROM test_names ORDER BY Length(Test_name) DESC", []);

        $testname = null;
        $fieldname = null;
        $fullname = $term->getDictionaryItem()->getName();
        foreach($rows as $testcandidate) {
            if (strpos($fullname, $testcandidate) === 0) {
                $testname = $testcandidate;
                $fieldname = substr($fullname, strlen($testname)+1);
                break;
            }
        }
        if($testname=== null) {
            throw new \DomainException("Field for unknown instrument");
        }

        $query = "SELECT c.CandID, f.CommentID
            FROM flag f 
            JOIN session s ON (s.ID=f.SessionID AND s.Active='Y')
            JOIN candidate c ON (s.CandID=c.CandID AND c.Active='Y')
            WHERE Test_name=:tn AND f.CommentID NOT LIKE 'DDE%'";
        $queryparams = ['tn' => $testname];
        if ($visitlist !== null) {
            $query .= ' AND s.Visit_label IN (';
            foreach ($visitlist as $vnum => $visit) {
                if ($vnum !== 0) {
                    $query .=', ';
                }
                $query .= ":visit$vnum";
                $queryparams["visit$vnum"] = $visit;
            }
            $query .= ')';
        }
        $data = $DB->pselect($query, $queryparams);
        $inst = \NDB_BVL_Instrument::factory($testname);
        $values = $inst->bulkLoadInstanceData(array_map(function($row) {
            return $row['CommentID'];
        }, $data));

        $map = [];
        foreach($data as $row) {
            $map[$row['CommentID']] = new CandID($row['CandID']);
        }
        return $this->filtered($values, $map, $fieldname, $term->getCriteria());
    }

    private function filtered($values, $candidmap, $fieldname, $criteria) : \Traversable {
        foreach($values as $inst) {
            $value = $inst->getFieldValue($fieldname);

            switch(get_class($criteria)) {
            case \LORIS\Data\Query\Criteria\In::class:
                foreach($criteria->getValue() as $valuecandidate) {
                    if($value == $valuecandidate) {
                        yield $candidmap[$inst->getCommentID()];
                    }
                }
                break;
            case \LORIS\Data\Query\Criteria\LessThan::class:
                if ($value !== null && $value < $criteria->getValue()) {
                    yield $candidmap[$inst->getCommentID()];
                }
                break;
            case \LORIS\Data\Query\Criteria\LessThanOrEqual::class:
                if ($value !== null && $value <= $criteria->getValue()) {
                    yield $candidmap[$inst->getCommentID()];
                }
                break;
            case \LORIS\Data\Query\Criteria\Equal::class:
                if ($value !== null && $value == $criteria->getValue()) {
                    yield $candidmap[$inst->getCommentID()];
                }
                break;
            case \LORIS\Data\Query\Criteria\NotEqual::class:
                if ($value !== null && $value != $criteria->getValue()) {
                    yield $candidmap[$inst->getCommentID()];
                }
                break;
            case \LORIS\Data\Query\Criteria\GreaterThanOrEqual::class:
                if ($value !== null && $value >= $criteria->getValue()) {
                    yield $candidmap[$inst->getCommentID()];
                }
                break;
            case \LORIS\Data\Query\Criteria\GreaterThan::class:
                if ($value !== null && $value > $criteria->getValue()) {
                    yield $candidmap[$inst->getCommentID()];
                }
                break;

            case \LORIS\Data\Query\Criteria\IsNull::class:
                if ($value === null) {
                    yield $candidmap[$inst->getCommentID()];
                }
                break;
            case \LORIS\Data\Query\Criteria\NotNull::class:
                if ($value !== null) {
                    yield $candidmap[$inst->getCommentID()];
                }
                break;

            case \LORIS\Data\Query\Criteria\StartsWith::class:
                if ($value !== null && strpos($value, $criteria->getValue()) === 0) {
                    yield $candidmap[$inst->getCommentID()];
                }
                break;
            case \LORIS\Data\Query\Criteria\EndsWith::class:
                $critval = $criteria->getValue();
                if ($value !== null &&
                    strrpos($value, $critval)
                        === strlen($value)-strlen($critval)
                ) {
                    yield $candidmap[$inst->getCommentID()];
                }
                break;
            case \LORIS\Data\Query\Criteria\Substring::class:
                if ($value !== null && strpos($value, $criteria->getValue()) !== false) {
                    yield $candidmap[$inst->getCommentID()];
                }
                break;
            default:
                throw new \Exception("Unhandled operator: " . get_class($criteria));
            }
        }
    }

    private $visitcache = [];
    public function getVisitList(\LORIS\Data\Dictionary\Category $inst, \LORIS\Data\Dictionary\DictionaryItem $item) : iterable
    {
        if($item->getScope()->__toString() !== 'session') {
            return null;
        }

        // An instrument's fields all have the same visit list, so cache
        // the results to ensure it's only queried once.
        if(isset($this->visitcache[$inst->getName()])) {
            return $this->visitcache[$inst->getName()];
        }

        $DB = \NDB_Factory::singleton()->database();
        $visits = $DB->pselectCol("SELECT DISTINCT s.Visit_Label
                                    FROM flag f
                                        JOIN session s ON (f.SessionID=s.ID)
                                        JOIN candidate c ON (c.CandID=s.CandID)
                                    WHERE s.Active='Y' AND c.Active='Y' and f.Test_name=:tn
                                    ORDER BY s.Visit_label",
            ['tn' => $inst->getName()]
        );

        $this->visitcache[$inst->getName()] = $visits;
        
        return $visits;
    }

    public function getCandidateData(array $items, array $candidates, ?array $visitlist) : iterable {
        return [];
    }

}
