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

use \LORIS\Data\Query\CandidateQuery;
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

            if (!isset($requestdata['criteria']) || count($requestdata['criteria']) === 0) {
                return $this->allCandidates();
            }

            return $this->doSearch($requestdata['criteria'], $requestdata['fields']);
        }
    }

    public function doSearch(array $crit, array $fields) : ResponseInterface {
        $results = [];
        foreach($crit as $modulename => $crit) {
            $lastvisitlist = null;
            $criteria = [];
            $module = \Module::factory($modulename);
            $dict = $this->getFlattenedDictionary($module);

            foreach ($crit as $fieldnum => $query) {
                $dictitem = $dict[$query['field']];
                switch ($query['op']) {
                case 'lt':
                    $criteria[] = new CandidateQuery($dictitem, new LessThan($query['value']));
                    break;
                case 'lte':
                    $criteria[] = new CandidateQuery($dictitem, new LessThanOrEqual($query['value']));
                    break;
                case 'eq':
                    $criteria[] = new CandidateQuery($dictitem, new Equal($query['value']));
                    break;
                case 'neq':
                    $criteria[] = new CandidateQuery($dictitem, new NotEqual($query['value']));
                    break;
                case 'gte':
                    $criteria[] = new CandidateQuery($dictitem, new GreaterThanOrEqual($query['value']));
                    break;
                case 'gt':
                    $criteria[] = new CandidateQuery($dictitem, new GreaterThan($query['value']));
                    break;
                case 'startsWith':
                    $criteria[] = new CandidateQuery($dictitem, new StartsWith($query['value']));
                    break;
                case 'endsWith':
                    $criteria[] = new CandidateQuery($dictitem, new EndsWith($query['value']));
                    break;
                case 'contains':
                    $criteria[] = new CandidateQuery($dictitem, new Substring($query['value']));
                    break;
                case 'isnotnull':
                    $criteria[] = new CandidateQuery($dictitem, new NotNull());
                    break;
                case 'isnull':
                    $criteria[] = new CandidateQuery($dictitem, new IsNull());
                    break;
                case 'in':
                    $criteria[] = new CandidateQuery($dictitem, new In(...$query['value']));
                    break;
                default:
                    throw new \Exception("Unhandled operator");
                }

                $visitlist = null;
                if (isset($query['visits'])) {
                    $visitlist = $query['visits'];
                }

                $matches = $module->getCandidateMatches($criteria, $visitlist);
                if (is_array($matches)) {
                    $results[] = $matches;
                } else {
                    $results[] = iterator_to_array($matches);
                }

                // FIXME: This only needs to be reset if the visitlist or module
                // changed, not re-settting it lets modules build more efficient
                // queries
                $criteria = [];
            }

        }

        $combinedresult = [];
        if (count($results) == 1) {
            $combinedresult = $results[0];
        } else {
            $combinedresult = array_intersect(...$results);
        }

        $candidates = array_values(array_unique($combinedresult));

        $fielddict = [];
        $vals = [];

        foreach ($fields as $modulename => $mfields) {
            $module = \Module::factory($modulename);

            $flatdict = $this->getFlattenedDictionary($module);

            $fielddict = [];

            foreach ($mfields as $fieldname) {
                $fielddict[] = $flatdict[$fieldname];
            }

            $asarray = $module->getCandidateData($fielddict, $candidates, null);
            if (!is_array($asarray)) {
                $asarray = iterator_to_array($asarray);
            }
            $vals = array_merge($vals, $asarray);
        }

        return new \LORIS\Http\Response\JSON\OK(
            ['data' => $vals],
        );
    }

    public function getFlattenedDictionary(\Module $module) {
        $rawdict = $module->getDataDictionary($this->loris);

        // Flattened dictionary without categories
        $dict = [];

        foreach ($rawdict as $cat) {
            foreach ($cat->getItems() as $item) {
                $dict[$item->getName()] = $item;
            }
        }
        return $dict;
    }

    public function allCandidates() : ResponseInterface {
        $db = \NDB_Factory::singleton()->database();
        $results = $db->pselectCol("SELECT CandID FROM candidate WHERE Active='Y'", []);
        $candIDs = array_map(function($row) {
            return new CandID($row);
        }, $results);

        return new \LORIS\Http\Response\JSON\OK(
            ['candidates' => $results]
        );


    }
}
