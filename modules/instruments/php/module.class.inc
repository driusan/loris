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
        return parent::hasAccess($user) && $user->hasPermission('data_entry');
    }

    /**
     * The instruments module loads instruments in LORIS.
     *
     * @param ServerRequestInterface $request The incoming PSR7 request
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        $resp = parent::handle($request);
        if ($resp->getStatusCode() != 404) {
            return $resp;
        }

        $path           = $request->getURI()->getPath();
        $pathComponents = [];

        // Breakdown path information from the request.
        preg_match(
            "#(/*)([a-zA-Z0-9_-]+)(/*)(.*)#",
            $path,
            $pathComponents
        );

        $instrumentName = $pathComponents[2];
        $page           = $pathComponents[4];

        $params    = $request->getQueryParams();
        $commentID = $params['commentID'] ?? null;
        if (empty($commentID)) {
            return (new \Laminas\Diactoros\Response())
                ->withBody(new \LORIS\Http\StringStream("Missing CommentID"))
                ->withStatus(400);
        }
        $instrument = \NDB_BVL_Instrument::factory(
            $instrumentName,
            $commentID,
            $page
        );

        $request = $request->withAttribute('pageclass', $instrument);

        return $instrument->process($request, $instrument);
    }

    /**
     * {@inheritDoc}
     *
     * @return string The human readable name for this module
     */
    public function getLongName() : string
    {
        return "Instruments";
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
    public function getWidgets(string $type, \User $user, array $options) : array
    {
        switch($type) {
        case "usertasks":
            $factory = \NDB_Factory::singleton();
            $DB      = $factory->database();
            $baseURL = $factory->settings()->getBaseURL();
            return [
                new \LORIS\dashboard\TaskQueryWidget(
                    $user,
                    "Incomplete form",
                    $DB,
                    "SELECT COUNT(*) FROM flag
                        LEFT JOIN session s ON (s.ID=flag.SessionID)
                        LEFT JOIN candidate c ON (s.CandID=c.CandID)
                    WHERE flag.Data_entry='In Progress'
                        AND s.Active='Y' AND c.Active='Y'",
                    'access_all_profiles',
                    's.CenterID',
                    $baseURL . "/statistics/statistics_site/",
                    ""
                ),

            ];
        case 'candidate':
            $factory = \NDB_Factory::singleton();
            $baseurl = $factory->settings()->getBaseURL();

            return [
                new \LORIS\candidate_profile\CandidateWidget(
                    "Behavioural Data",
                    $baseurl . "/instruments/js/CandidateInstrumentList.js",
                    'lorisjs.instruments.CandidateInstrumentList.default',
                    [],
                    2,
                    2,
                ),
            ];
        }
        return [];
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
    public function getDataDictionary(\LORIS\LorisInstance $loris) : iterable
    {
        $DB = $loris->getDatabaseConnection();

        $rows = $DB->pselectCol("SELECT Test_name FROM test_names", []);

        $dict = [];
        foreach ($rows as $testname) {
            try {
                $inst   = \NDB_BVL_Instrument::factory($testname, "", "");
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

    public function getCandidateMatches(array $criteria, ?array $visitlist=null) : iterable {
        // This is stupid, but the parameter_type_override table uses '_' as a delimiter 
        // between instrument and fieldname, despite the fact that either one may itself
        // have a _ in the name. This can't be easily changed without losing all
        // existing overrides from the old datadict module.
        //
        // We walk the existing test names ordered by length to look for the longest prefix
        // match to find out what the instrument for the fieldname is.
        $DB = \Database::singleton();
        $rows = $DB->pselectCol("SELECT Test_name FROM test_names ORDER BY Length(Test_name) DESC", []);

        foreach($criteria as $crit) {
            $testname = null;
            $fieldname = null;
            $fullname = $crit->getDictionaryItem()->getName();
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

            $data = $DB->pselect("SELECT c.CandID, f.CommentID
                FROM flag f 
                    JOIN session s ON (s.ID=f.SessionID AND s.Active='Y')
                    JOIN candidate c ON (s.CandID=c.CandID AND c.Active='Y')
                WHERE Test_name=:tn", ['tn' => $testname]);
            //var_dump($commentIDs);
            $inst = \NDB_BVL_Instrument::factory($testname);
            $values = $inst->bulkLoadInstanceData(array_map(function($row) {
                return $row['CommentID'];
            }, $data));

            $map = [];
            foreach($data as $row) {
                $map[$row['CommentID']] = new CandID($row['CandID']);
            }
            return $this->filtered($values, $map, $fieldname, $crit->getCriteria());
        }
    }

    private function filtered($values, $candidmap, $fieldname, $criteria) : \Traversable {
        foreach($values as $inst) {
            $value = $inst->getFieldValue($fieldname);

            switch(get_class($criteria)) {
            case \LORIS\Data\Query\InCriteria::class:
                foreach($criteria->getValue() as $valuecandidate) {
                    if($value == $valuecandidate) {
                        /*
                        var_dump($candidmap);
                        var_dump($inst->getCommentID());
                        exit;
                         */
                        yield $candidmap[$inst->getCommentID()];
                    }
                }
                break;
            default:
                throw new \Exception("Unhandled operator: " . get_class($criteria));
            }
        }
    }
}

