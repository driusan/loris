<?php
namespace LORIS\dqt;
use \LORIS\StudyEntities\Candidate\CandID;

class QueryRun implements \LORIS\StudyEntities\AccessibleResource {
    public function __construct(protected \LORIS\LorisInstance $loris, protected Query $query, protected ?int $RunID) {
    }

    public function isAccessibleBy(\User $user) : bool {
        // FIXME: validate all fields and modules
        // are accessible
        return true;
    }

    public function getQuery() : Query {
        return $this->query;
    }

    public function matchCandidates(\User $user) : void {
        if ($this->query->getCriteria()) {
            throw new \LorisException("Filters not implemented");
        }
        $allCandidates = $this->allCandidates();
        $candidates = $this->filterInaccessibleCandidatesAndInsert($allCandidates, $user);
    }
    public function getQueryDataProvisioner() {
        return new QueryDataProvisioner($this->loris, $this);
    }

    public function getCandidates() : array {
        if ($this->query->getCriteria()) {
            throw new \LorisException("Filters not implemented");
        }
        $DB = $this->loris->getDatabaseConnection();
        $candIDs = $DB->pselectCol("SELECT CandID FROM dataquery_run_results WHERE RunID=:run", ['run' => $this->RunID]);

        return array_map(function ($val) {
            return new CandID($val);
        }, $candIDs);

    }

    private function allCandidates() : array {
        $db = $this->loris->getDatabaseConnection();
        $results = $db->pselectCol("SELECT CandID FROM candidate WHERE Active='Y' ORDER BY CandID ", []);

        return array_map(function($row) {
            return new CandID($row);
        }, $results);
    }

    private function filterInaccessibleCandidatesAndInsert(array $candIDs, \User $user) : void {
        $DB = $this->loris->getDatabaseConnection();

        // Put candidates into a temporary table so that it can be used in a join
        // clause. Directly using "c.CandID IN (candid1, candid2, candid3, etc)" is
        // too slow to be useable.
        $DB->run("DROP TEMPORARY TABLE IF EXISTS accesscandidates");
        $DB->run("CREATE TEMPORARY TABLE accesscandidates(
            CandID int(6)
        );");
        $insertstmt = "INSERT INTO accesscandidates VALUES (" . join('),(', $candIDs) . ')';
        $q = $DB->prepare($insertstmt);
        $q->execute([]);

        // Get the data which affects accessibility in bulk.
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

        // Foreach CandID, create the TimePointData object for all timepoints
        // that were returned.
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

        // Remove inaccessible candidates from the temp table
        foreach($organized as $vals) {
            $canddata = new \CandidateData(
                new \ProjectID($vals['RegistrationProject']),
                new \CenterID($vals['RegistrationCenter']),
                $vals['Timepoints']
            );
            $candidate = new \Candidate($canddata);

            if (!$candidate->isAccessibleBy($user)) {
                // Not accessible, so delete from accesscandidates
                $DB->delete("accesscandidates", ['CandID' => $vals['CandID']]);
                continue;
            }
        }
        // Insert everything into the non-temp table in a batch
        $DB->run("INSERT INTO dataquery_run_results (RunID, CandID) SELECT $this->RunID, CandID FROM accesscandidates");
        return;
    }
}
?>
