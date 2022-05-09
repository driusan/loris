<?php
/**
 * Datadict module
 *
 * PHP version 7
 *
 * @category Datadict
 * @package  Main
 * @author   Ted Strauss <ted.strauss@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris-Trunk
 */
namespace LORIS\candidates;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

use LORIS\StudyEntities\Candidate\CandID;

use \LORIS\Data\Query\QueryTerm;
use \LORIS\Data\Query\Criteria\Equal;
use \LORIS\Data\Query\Criteria\NotEqual;
use \LORIS\Data\Query\Criteria\In;
use \LORIS\Data\Query\Criteria\LessThan;
use \LORIS\Data\Query\Criteria\LessThanOrEqual;
use \LORIS\Data\Query\Criteria\GreaterThan;
use \LORIS\Data\Query\Criteria\GreaterThanOrEqual;

use \LORIS\Data\Query\Criteria\IsNull;
use \LORIS\Data\Query\Criteria\NotNull;

use \LORIS\Data\Query\Criteria\StartsWith;
use \LORIS\Data\Query\Criteria\Substring;
use \LORIS\Data\Query\Criteria\EndsWith;


/**
 * Datadict module
 *
 * PHP version 7
 *
 * @category Datadict
 * @package  Main
 * @author   Ted Strauss <ted.strauss@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris-Trunk
 */

class Search extends \NDB_Page
{
    public $skipTemplate = true;
    /**
     * Allow all users for testing
     *
     * @param \User $user The user whose access is being checked
     *
     * @return bool
     */
    function _hasAccess(\User $user) : bool
    {
        return true;
    }

    public function handle(ServerRequestInterface $request) : ResponseInterface {
        $this->loris = $request->getAttribute("loris");

        switch ($request->getMethod()) {
        case 'POST':
            $requestdata = json_decode((string) $request->getBody(), true);

            if ($requestdata['type'] === 'sessions') {
                return new \LORIS\Http\Response\JSON\NotImplemented('Session search not implemented');
            } else if ($requestdata['type'] !== 'candidates') {
                return new \LORIS\Http\Response\JSON\BadRequest('Invalid search type');
            }


            error_log('Peak memory usage before getting candidates ' . memory_get_peak_usage() . ' bytes');
            $candIDs = [];
            if (!isset($requestdata['criteria']) || count($requestdata['criteria']) === 0) {
                $candIDs = $this->allCandidates();
            } else {
                $candIDs = $this->candidateMatches($requestdata['criteria']);
            }

            $candIDs = $this->filterInaccessibleCandidates($candIDs);
            error_log('Peak memory usage after candidates ' . memory_get_peak_usage() . ' bytes');
            $x = $this->resultsForCandidates($candIDs, $requestdata['fields']);
            error_log('Peak memory usage after results ' . memory_get_peak_usage() . ' bytes');
            return $x;
        }
    }

    public function candidateMatches(array $crit) : array {
        $results = [];

        $startMemory = memory_get_usage();
        foreach($crit as $modulename => $crit) {
            $mStartMemory = memory_get_usage();
            $now = time();
            $engine = \Module::factoryWithInstance($modulename, $this->loris)->getQueryEngine();
            $dict = $this->getFlattenedDictionary($engine);

            foreach ($crit as $fieldnum => $query) {
                // Get a new engine for each term to reset the internal state
                $dictitem = $dict[$query['field']];
                switch ($query['op']) {
                case 'lt':
                    $criteria = new QueryTerm($dictitem, new LessThan($query['value']));
                    break;
                case 'lte':
                    $criteria = new QueryTerm($dictitem, new LessThanOrEqual($query['value']));
                    break;
                case 'eq':
                    $criteria = new QueryTerm($dictitem, new Equal($query['value']));
                    break;
                case 'neq':
                    $criteria = new QueryTerm($dictitem, new NotEqual($query['value']));
                    break;
                case 'gte':
                    $criteria = new QueryTerm($dictitem, new GreaterThanOrEqual($query['value']));
                    break;
                case 'gt':
                    $criteria = new QueryTerm($dictitem, new GreaterThan($query['value']));
                    break;
                case 'startsWith':
                    $criteria = new QueryTerm($dictitem, new StartsWith($query['value']));
                    break;
                case 'endsWith':
                    $criteria = new QueryTerm($dictitem, new EndsWith($query['value']));
                    break;
                case 'contains':
                    $criteria = new QueryTerm($dictitem, new Substring($query['value']));
                    break;
                case 'isnotnull':
                    $criteria = new QueryTerm($dictitem, new NotNull());
                    break;
                case 'isnull':
                    $criteria = new QueryTerm($dictitem, new IsNull());
                    break;
                case 'in':
                    $criteria = new QueryTerm($dictitem, new In(...$query['value']));
                    break;
                default:
                    throw new \Exception("Unhandled operator: " . $query['op']);
                }

                $visitlist = null;
                if (isset($query['visits'])) {
                    $visitlist = $query['visits'];
                }

                $matches = $engine->getCandidateMatches($criteria, $visitlist);
                if (is_array($matches)) {
                    $results[] = $matches;
                } else {
                    $results[] = iterator_to_array($matches);
                }
            }
            error_log("Finding candidates for module $modulename took " . (time() - $now) . "s");
            error_log("Memory used for $modulename was " . (memory_get_usage() - $mStartMemory) . " bytes of memory");
        }

        error_log("Before intersection used " . (memory_get_usage() - $startMemory) . " bytes of memory");
        $combinedresult = [];
        if (count($results) == 1) {
            $combinedresult = $results[0];
        } else {
            $combinedresult = array_intersect(...$results);
        }

        $candidates = array_values(array_unique($combinedresult));

        error_log("Candidate matches used " . (memory_get_usage() - $startMemory) . " bytes of memory");
        return $candidates;
    }

    public function getFlattenedDictionary(\LORIS\Data\Query\QueryEngine $engine) {
        $rawdict = $engine->getDataDictionary();

        // Flattened dictionary without categories
        $dict = [];

        foreach ($rawdict as $cat) {
            foreach ($cat->getItems() as $item) {
                $dict[$item->getName()] = $item;
            }
        }
        return $dict;
    }

    public function allCandidates() : array {
        $db = \NDB_Factory::singleton()->database();
        $results = $db->pselectCol("SELECT CandID FROM candidate WHERE Active='Y' ORDER BY CandID ", []);

        return array_map(function($row) {
            return new CandID($row);
        }, $results);
    }

    public function resultsForCandidates(array $candidates, array $fieldsarray) : ResponseInterface {
        error_log("!!!!!!!!!Results for candidates");
        $fielddict = [];
        $vals = [];

        $startMemory = memory_get_usage();
        $dataiterators = [];
        $fields = [];

        // Convert from an array of fieldnames to an array of
        // fieldnames per module, to minimize the number of roundtrips
        // to the module
        foreach ($fieldsarray as $field) {
            $mname = $field['module'];
            $fname = $field['field'];
            if(!isset($fields[$mname])) {
                $fields[$mname] = [];
            }
            $fields[$mname][] = $fname;
        }

        // Run the query against each module and store the resulting
        // iterators in the $dataiterators array.
        foreach ($fields as $modulename => $mfields) {
            error_log("Module: $modulename");
            $mStartMemory = memory_get_usage();
            $now = time();
            $engine = \Module::factoryWithInstance($modulename, $this->loris)->getQueryEngine();

            $flatdict = $this->getFlattenedDictionary($engine);

            $fielddict = [];

            foreach ($mfields as $fieldname) {
                $fielddict[] = $flatdict[$fieldname];
            }

            $n1 = time();
            $dataiterators[$modulename] = $engine->getCandidateData($fielddict, $candidates, null);
            error_log("Iterator for $modulename took " . (memory_get_usage() - $mStartMemory) ." bytes");
            /*
            $asarray = $dataiterators[$modulename];
            error_log("Getting data for module $modulename took " . (time() - $n1) . "s");

            $n2 = time();
            foreach ($asarray as $candid => $val) {
                $vals[$candid] = array_merge($vals[$candid] ?? [], $val);
            }
            error_log("Merging data for $modulename took " . (time() - $n2) ."s");
             */
        }


        $response = (new \LORIS\Http\Response())
            //->withHeader("Content-Type", "application/octet-stream")
            ->withHeader("Content-Type", "text/plain")
            //->withBody(new \LORIS\Http\DataIteratorBinaryStream($this->mergeIterators([], $dataiterators)));
            ->withBody(new \LORIS\Http\DataIteratorBinaryStream($this->mergeIterators($candidates, $dataiterators, $fieldsarray)));
        error_log("Results matches used " . (memory_get_usage() - $startMemory) . " bytes of memory");
        return $response;
    }

    private function mergeIterators(array $candidates, array $iterators, array $fields) {
        foreach($candidates as $candID) {
            $val = [];
            // Initialize the row to ensure there's no unset indexes for
            // the DataIteratorBinaryStream when it does array_join.
            for($i = 0; $i < count($fields); $i++) {
                $val[$i] = '';
            }
            
            // Go through each module, if it has data for this candidate
            // put it in the appropriate columns.
            foreach($iterators as $modulename => $moduledata) {
                if(is_array($moduledata)) {
                    continue;
                }
                if(!$moduledata->valid()) {
                    continue;
                }
                $modcandidate = $moduledata->key();
                // The candidate data must have been sorted by 
                // CandID for our logic to work.
                // Coerce to string for the comparison so that <=
                // works. (We can't do a <= comparison on a CandID
                // object)
                assert("$candID" <= "$modcandidate");

                // If the module has data for this candID, populate it,
                // if not, don't advance the iterator.
                if($modcandidate == $candID) {
                    // Go through each field and put the data in the right
                    // index if applicable.
                    $data = $moduledata->current();
                    foreach ($fields as $idx => $field) {
                        if ($field['module'] != $modulename) {
                            continue;
                        }
                        $fname = $field['field'];
                        if (!isset($data[$fname])) {
                            continue;
                        }
                        $val[$idx] = $data[$fname];
                    }

                    // Advance this iterator to the next row
                    // now that we've dealt with this CandID for
                    // this module.
                    $moduledata->next();
                }
            }

            // We've went through all the module iterators and can
            // now yield the value for this row.
            yield $candID => $val;
        }
    }

    // Xavier's work. Stolen from https://github.com/xlecours/Loris/blob/DQT_couchprovisioner/modules/dqt/php/querygroup.class.inc
    private static function _intersect(\Traversable $iter1, \Traversable $iter2): \Traversable {
        foreach($iter1 as $value1) {
            if (!$iter2->valid()) {
                return;
            }
            switch($value1 <=> $iter2->current()) {
                case -1:
                    // iter1 is smaller than iter2.
                    // Move to next foreach.
                    break;
                case 0:
                    // Both iter1 and iter2 are equal.
                    // Move iter2 and yield $value before moving to next foreach.
                    $iter2->next();
                    yield $value1;
                    break;
                case 1:
                    // iter1 is greater than iter2.
                    // Advance iter2 until it is greater or equal to iter1.
                    while ($iter2->current() < $value1) {
                        $iter2->next();
                        if (!$iter2->valid()) {
                            return;
                        }
                    }
                    if ($value1 == $iter2->current()) {
                        // Both iter1 and iter2 are equal.
                        // Yield $value before moving to next foreach.
                        yield $value1;
                    }
                    break;
            }
        }
    }

    public function filterInaccessibleCandidates(array $candIDs) : array {
        $DB = \NDB_Factory::singleton()->database();

        // Put candidates into a temporary table so that it can be used in a join
        // clause. Directly using "c.CandID IN (candid1, candid2, candid3, etc)" is
        // too slow.
        $DB->run("DROP TEMPORARY TABLE IF EXISTS accesscandidates");
        $DB->run("CREATE TEMPORARY TABLE accesscandidates(
            CandID int(6)
        );");
        $insertstmt = "INSERT INTO accesscandidates VALUES (" . join('),(', $candIDs) . ')';
        $q = $DB->prepare($insertstmt);
        $q->execute([]);

        $rows = $DB->pselect(
            "SELECT c.CandID, c.RegistrationProjectID, c.RegistrationCenterID,
                s.ProjectID as SProjectID, s.CenterID as SCenterID,
                s.ID as sessionID
            FROM candidate c LEFT JOIN session s ON (s.CandID=c.CandID)
            WHERE c.Active='Y' AND COALESCE(s.Active, 'Y')='Y'
                AND c.CandID IN (SELECT CandID FROM accesscandidates)
            ORDER BY c.CandID",
            []
        );
        $organized = [];
        foreach ($rows as $row) {
            $candid = $row['CandID'];
            if(!isset($organized[$candid])) {
                $organized[$candid] = [
                    'CandID' => new CandID($row['CandID']),
                    'RegistrationProject' => $row['RegistrationProjectID'],
                    'RegistrationCenter' => $row['RegistrationCenterID'],
                    'Timepoints' => [],
                ];
            }

            if ($row['sessionID'] !== null) {
                $organized[$candid]['Timepoints'][] = new \TimePoint(new \TimePointData(
                    new \SessionID($row['sessionID']),
                    new \ProjectID($row['SProjectID']),
                    new \CenterID($row['SCenterID']),
                ));
            }
        }

        $results = [];
        $user = \User::singleton();
        foreach($organized as $vals) {
            $canddata = new \CandidateData(
                new \ProjectID($vals['RegistrationProject']),
                new \CenterID($vals['RegistrationCenter']),
                $vals['Timepoints']
            );
            $candidate = new \Candidate($canddata);

            if (!$candidate->isAccessibleBy($user)) {
                continue;
            }
            $results[] = $vals['CandID'];
        }
        return $results;
    }
}
