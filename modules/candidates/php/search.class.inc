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
use \LORIS\Data\Query\EqualCriteria;
use \LORIS\Data\Query\NotEqualCriteria;
use \LORIS\Data\Query\InCriteria;
use \LORIS\Data\Query\LessThanCriteria;
use \LORIS\Data\Query\LessThanOrEqualCriteria;
use \LORIS\Data\Query\GreaterThanCriteria;
use \LORIS\Data\Query\GreaterThanOrEqualCriteria;
use \LORIS\Data\Query\NullCriteria;
use \LORIS\Data\Query\NotNullCriteria;

use \LORIS\Data\Query\StartsWithCriteria;
use \LORIS\Data\Query\SubstringCriteria;
use \LORIS\Data\Query\EndsWithCriteria;


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
            $criteria = [];
            $module = \Module::factory($modulename);
            $dict = $this->getFlattenedDictionary($module);

            foreach ($crit as $query) {
                $dictitem = $dict[$query['field']];
                switch ($query['op']) {
                case 'lt':
                    $criteria[] = new CandidateQuery($dictitem, new LessThanCriteria($query['value']));
                    break;
                case 'lte':
                    $criteria[] = new CandidateQuery($dictitem, new LessThanOrEqualCriteria($query['value']));
                    break;
                case 'eq':
                    $criteria[] = new CandidateQuery($dictitem, new EqualCriteria($query['value']));
                    break;
                case 'neq':
                    $criteria[] = new CandidateQuery($dictitem, new NotEqualCriteria($query['value']));
                    break;
                case 'gte':
                    $criteria[] = new CandidateQuery($dictitem, new GreaterThanOrEqualCriteria($query['value']));
                    break;
                case 'gt':
                    $criteria[] = new CandidateQuery($dictitem, new GreaterThanCriteria($query['value']));
                    break;
                case 'startsWith':
                    $criteria[] = new CandidateQuery($dictitem, new StartsWithCriteria($query['value']));
                    break;
                case 'endsWith':
                    $criteria[] = new CandidateQuery($dictitem, new EndsWithCriteria($query['value']));
                    break;
                case 'contains':
                    $criteria[] = new CandidateQuery($dictitem, new SubstringCriteria($query['value']));
                    break;
                case 'isnotnull':
                    $criteria[] = new CandidateQuery($dictitem, new NotNullCriteria());
                    break;
                case 'isnull':
                    $criteria[] = new CandidateQuery($dictitem, new NullCriteria());
                    break;
                case 'in':
                    $criteria[] = new CandidateQuery($dictitem, new InCriteria(...$query['value']));
                    break;
                default:
                    throw new \Exception("Unhandled operator");
                }
            }

            $matches = $module->getCandidateMatches($criteria, null);
            if (is_array($matches)) {
                $results[] = $matches;
            } else {
                $results[] = iterator_to_array($matches);
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

            $vals = array_merge($vals, iterator_to_array($module->getCandidateData($fielddict, $candidates, null)));
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
