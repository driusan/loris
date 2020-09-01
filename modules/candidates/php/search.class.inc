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

            if (!isset($requestdata['criteria']) || count($requestdata['criteria']) === 0) {
                return $this->allCandidates();
            }

            return $this->doSearch($requestdata['criteria'], $requestdata['fields']);
        }
    }

    public function doSearch(array $crit, array $fields) : ResponseInterface {
        $results = [];
        foreach($crit as $modulename => $crit) {
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
            $engine = \Module::factoryWithInstance($modulename, $this->loris)->getQueryEngine();

            $flatdict = $this->getFlattenedDictionary($engine);

            $fielddict = [];

            foreach ($mfields as $fieldname) {
                $fielddict[] = $flatdict[$fieldname];
            }

            $asarray = $engine->getCandidateData($fielddict, $candidates, null);
            if (!is_array($asarray)) {
                $asarray = iterator_to_array($asarray);
            }
            $vals = array_merge($vals, $asarray);
        }

        return new \LORIS\Http\Response\JSON\OK(
            ['data' => $vals],
        );
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
