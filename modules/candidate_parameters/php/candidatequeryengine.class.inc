<?php
declare(strict_types=1);
namespace LORIS\candidate_parameters;
use LORIS\candidate_profile\CandidateInfo;
use LORIS\candidate_profile\CandidateWidget;
use LORIS\Data\Scope;
use LORIS\Data\Cardinality;
use LORIS\Data\Dictionary\DictionaryItem;
use LORIS\StudyEntities\Candidate\CandID;

use LORIS\Data\Query\Criteria\Equal;
use LORIS\Data\Query\Criteria\NotEqual;
use LORIS\Data\Query\Criteria\LessThan;
use LORIS\Data\Query\Criteria\LessThanOrEqual;
use LORIS\Data\Query\Criteria\GreaterThanOrEqual;
use LORIS\Data\Query\Criteria\GreaterThan;
use LORIS\Data\Query\Criteria\In;

use LORIS\Data\Query\Criteria\NotNull;
use LORIS\Data\Query\Criteria\IsNull;

use LORIS\Data\Query\Criteria\StartsWith;
use LORIS\Data\Query\Criteria\Substring;
use LORIS\Data\Query\Criteria\EndsWith;

/**
 * {@inheritDoc}
 *
 * @license http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class CandidateQueryEngine extends \LORIS\Data\Query\SQLQueryEngine
{
    /**
     * Return a data dictionary of data types managed by this module.
     * DictionaryItems are grouped into categories and a module may
     * provide 0 or more categories of dictionaryitems.
     *
     * @param \LORIS\LorisInstance $loris The LORIS instance whose data
     *                                    dictionary should be retrieved.
     *
     * @return \LORIS\Data\Dictionary\Category[]
     */
    public function getDataDictionary() : iterable
    {
        $candscope = new Scope(Scope::CANDIDATE);
        $sesscope = new Scope(Scope::SESSION);

        $ids = new \LORIS\Data\Dictionary\Category("Identifiers", "Candidate Identifiers");

        $ids = $ids->withItems([
            new DictionaryItem(
                "CandID",
                "LORIS Candidate Identifier",
                $candscope,
                new \LORIS\Data\Types\IntegerType(999999),
                new Cardinality(Cardinality::UNIQUE),
            ),
            new DictionaryItem(
                "PSCID",
                "Project Candidate Identifier",
                $candscope,
                new \LORIS\Data\Types\StringType(255),
                new Cardinality(Cardinality::UNIQUE),
            ),
        ]);
        
        $demographics = new \LORIS\Data\Dictionary\Category("Demographics", "Candidate Demographics");
        $demographics= $demographics->withItems([
            new DictionaryItem(
                "DoB",
                "Date of Birth",
                $candscope,
                new \LORIS\Data\Types\DateType(),
                new Cardinality(Cardinality::SINGLE),
            ),
            new DictionaryItem(
                "DoD",
                "Date of Death",
                $candscope,
                new \LORIS\Data\Types\DateType(),
                new Cardinality(Cardinality::OPTIONAL),
            ),
            new DictionaryItem(
                "Sex",
                "Candidate's biological sex",
                $candscope,
                new \LORIS\Data\Types\Enumeration('Male', 'Female', 'Other'),
                new Cardinality(Cardinality::SINGLE),
            ),
            new DictionaryItem(
                "EDC",
                "Expected Data of Confinement",
                $candscope,
                new \LORIS\Data\Types\DateType(),
                new Cardinality(Cardinality::OPTIONAL),
            ),
        ]);
        
        $meta = new \LORIS\Data\Dictionary\Category("Meta", "Other parameters");

        $db = $this->loris->getDatabaseConnection();
        $participantstatus_options = $db->pselectCol(
            "SELECT Description FROM participant_status_options",
            []
        );
        $meta = $meta->withItems([
            new DictionaryItem(
                "VisitLabel",
                "The study visit label",
                $sesscope,
                new \LORIS\Data\Types\StringType(255),
                new Cardinality(Cardinality::UNIQUE),
            ),
            new DictionaryItem(
                "Project",
                "The LORIS project to categorize this session",
                $sesscope,
                new \LORIS\Data\Types\StringType(255), // FIXME: Make an enum
                new Cardinality(Cardinality::SINGLE),
            ),
            new DictionaryItem(
                "Subproject",
                "The LORIS subproject used for battery selection",
                $sesscope,
                new \LORIS\Data\Types\StringType(255),
                new Cardinality(Cardinality::SINGLE),
            ),
            new DictionaryItem(
                "Site",
                "The Site at which a visit occurred",
                $sesscope,
                new \LORIS\Data\Types\Enumeration(...\Utility::getSiteList()),
                new Cardinality(Cardinality::SINGLE),
            ),
            new DictionaryItem(
                "EntityType",
                "The type of entity which this candidate represents",
                $candscope,
                new \LORIS\Data\Types\Enumeration('Human', 'Scanner'),
                new Cardinality(Cardinality::SINGLE),
            ),
            new DictionaryItem(
                "ParticipantStatus",
                "The status of the participant within the study",
                $candscope,
                new \LORIS\Data\Types\Enumeration(...$participantstatus_options),
                new Cardinality(Cardinality::SINGLE),
            ),
            new DictionaryItem(
                "RegistrationSite",
                "The site at which this candidate was initially registered",
                $candscope,
                new \LORIS\Data\Types\Enumeration(...\Utility::getSiteList()),
                new Cardinality(Cardinality::SINGLE),
            ),
            new DictionaryItem(
                "RegistrationProject",
                "The project for which this candidate was initially registered",
                $candscope,
                new \LORIS\Data\Types\StringType(255), // FIXME: Make an enum
                new Cardinality(Cardinality::SINGLE),
            ),
        ]);
        return [$ids, $demographics, $meta];
    }

    /**
     * Returns a list of candidates where all criteria matches. When multiple
     * criteria are specified, the result is the AND of all the criteria.
     */
    public function getCandidateMatches(\LORIS\Data\Query\QueryTerm $term, ?array $visitlist=null) : iterable {
        $this->resetEngineState();
        $this->addTable('candidate c');
        $this->addWhereClause("c.Active='Y'");
        $prepbindings = [];

        $this->buildQueryFromCriteria($term, $prepbindings);

        $query = 'SELECT DISTINCT c.CandID FROM';

        $query .= ' ' . $this->getTableJoins();

        $query .= ' WHERE ';
        $query .= $this->getWhereConditions();
        $query .= ' ORDER BY c.CandID';

        $DB = $this->loris->getDatabaseConnection();
        $rows = $DB->pselectCol($query, $prepbindings);

        return array_map(function($cid) {
            return new CandID($cid);
        }, $rows);
    }

      public function getVisitList(\LORIS\Data\Dictionary\Category $inst, \LORIS\Data\Dictionary\DictionaryItem $item) : iterable
      {
          if($item->getScope()->__toString() !== 'session') {
              return null;
          }

          // Session scoped variables: VisitLabel, project, site, subproject
          return array_keys(\Utility::getVisitList());
      }

    /**
     * @param DictionaryItem[] $items
     * @param CandID[] $candidates
     * @param ?VisitLabel[] $visits
     *
     * @return DataInstance[]
     */
    public function getCandidateData(array $items, array $candidates, ?array $visitlist) : iterable {
        if (count($candidates) == 0) {
            return [];
        }
        $this->resetEngineState();

        $this->addTable('candidate c');

        // Always required for candidateCombine
        $fields = ['c.CandID'];

        $now = time();

        $DBSettings = $this->loris->getConfiguration()->getSetting("database");

        if (!$this->useBufferedQuery) {
            $DB = new \PDO(
                "mysql:host=$DBSettings[host];dbname=$DBSettings[database];charset=UTF8",
                $DBSettings['username'],
                $DBSettings['password'],
            );
            if ($DB->setAttribute(\PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, false) == false) {
                throw new \DatabaseException("Could not use unbuffered queries");
            };

            $this->createTemporaryCandIDTablePDO($DB, "searchcandidates", $candidates);
        } else {
            $DB = \Database::singleton();
            $this->createTemporaryCandIDTable($DB, "searchcandidates", $candidates);
        }

        foreach ($items as $dict) {
            $fields[] = $this->getFieldNameFromDict($dict) . ' as ' . $dict->getName();
        }

        $query = 'SELECT ' . join(', ', $fields) . ' FROM';
        $query .= ' ' . $this->getTableJoins();

        $prepbindings = [];
        $query .= ' WHERE c.CandID IN (SELECT CandID from searchcandidates)';

        if ($visitlist != null) {
            $inset = [];
            $i = count($prepbindings);
            foreach($visitlist as $vl) {
                $prepname = ':val' . $i++;
                $inset[] = $prepname;
                $prepbindings[$prepname] = $vl;
            }
            $query .= 'AND s.Visit_label IN (' . join(",", $inset) . ')';
        }
        $query .= ' ORDER BY c.CandID';

        $now = time();
        error_log("Running query $query");
        $rows = $DB->prepare($query);

        error_log("Preparing took " . (time() - $now) . "s");
        $now = time();
        $result= $rows->execute($prepbindings);
        error_log("Executing took" . (time() - $now) . "s");

        error_log("Executing query");
        if($result === false) {
            throw new Exception("Invalid query $query");
        }

        error_log("Combining candidates");
        return $this->candidateCombine($items, $rows);
        $val = $this->candidateCombine($items, $rows);
        error_log("Combined candidates");
        return $val;
    }


    private function getFieldNameFromDict(\LORIS\Data\Dictionary\DictionaryItem $item) : string {
        switch($item->getName()) {
        case 'CandID':
            return 'c.CandID';
        case 'PSCID':
            return 'c.PSCID';
        case 'Site':
            $this->addTable('LEFT JOIN session s ON (s.CandID=c.CandID)');
            $this->addTable('LEFT JOIN psc site ON (s.CenterID=site.CenterID)');
            $this->addWhereClause("s.Active='Y'");
            return 'site.Name';
        case 'RegistrationSite':
            $this->addTable('LEFT JOIN psc rsite ON (c.RegistrationCenterID=rsite.CenterID)');
            return 'rsite.Name';
        case 'Sex':
            return 'c.Sex';
        case 'DoB':
            return 'c.DoB';
        case 'DoD':
            return 'c.DoD';
        case 'EDC':
            return 'c.EDC';
        case 'Project':
            $this->addTable('LEFT JOIN session s ON (s.CandID=c.CandID)');
            $this->addTable('LEFT JOIN project proj ON (s.ProjectID=proj.ProjectID)');
            $this->addWhereClause("s.Active='Y'");

            return 'proj.Name';
        case 'RegistrationProject':
            $this->addTable('LEFT JOIN project rproj ON (c.RegistrationProjectID=rproj.ProjectID)');
            return 'rproj.Name';
        case 'Subproject':
            $this->addTable('LEFT JOIN session s ON (s.CandID=c.CandID)');
            $this->addTable('LEFT JOIN subproject subproj ON (s.SubprojectID=subproj.SubProjectID)');
            $this->addWhereClause("s.Active='Y'");

            return 'subproj.title';
        case 'VisitLabel':
            $this->addTable('LEFT JOIN session s ON (s.CandID=c.CandID)');
            $this->addWhereClause("s.Active='Y'");
            return 's.Visit_label';
        case 'EntityType':
            return 'c.Entity_type';
        case 'ParticipantStatus':
            $this->addTable('LEFT JOIN participant_status ps ON (ps.CandID=c.CandID)');
            $this->addTable('LEFT JOIN participant_status_options pso ON (ps.participant_status=pso.ID)');
            return 'pso.Description';
        default:
            throw new \DomainException("Invalid field " . $dict->getName());
        }
    }

    private function buildQueryFromCriteria(\LORIS\Data\Query\QueryTerm $term, array &$prepbindings, ?array $visitlist = null) {
        $dict = $term->getDictionaryItem();
        $this->addWhereCriteria($this->getFieldNameFromDict($dict), $term->getCriteria(), $prepbindings);

        if ($visitlist != null) {
            $this->addTable('LEFT JOIN session s ON (s.CandID=c.CandID)');
            $this->addWhereClause("s.Active='Y'");
            $inset = [];
            $i = count($prepbindings);
            foreach($visitlist as $vl) {
                $prepname = ':val' . ++$i;
                $inset[] = $prepname;
                $prepbindings[$prepname] = $vl;
            }
            $this->addWhereClause('s.Visit_label IN (' . join(",", $inset) . ')');
        }
    }
}