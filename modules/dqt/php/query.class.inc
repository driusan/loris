<?php

namespace LORIS\dqt;
use \LORIS\StudyEntities\Candidate\CandID;

class Query implements \LORIS\StudyEntities\AccessibleResource {
    protected $data;
    public function __construct(protected \LORIS\LorisInstance $loris, protected int $queryID) {
        $DB = $loris->getDatabaseConnection();

        $data = $DB->pselectOne("
            SELECT dq.Query
                FROM dataquery_queries dq
            WHERE QueryID=:qid",
            ['qid' => $queryID]
        );
        if ($data === null) {
            throw new \NotFound("Query $queryID not found");
        }
        $this->data = json_decode($data, true);
    }

    public function isAccessibleBy(\User $user) : bool {
        // FIXME: validate all fields and modules
        // are accessible
        return true;
    }

    public function toArray() : array {
        return $this->data;
    }

    public function pin(\User $user) {
        $DB = $this->loris->getDatabaseConnection();
        $DB->insertIgnore('dataquery_pinned_queries_rel',
            [
                'QueryID' => $this->queryID,
                'PinnedBy' => $user->getId(),
            ]
        );

    }

    public function unpin(\User $user) {
        $DB = $this->loris->getDatabaseConnection();
        $DB->delete('dataquery_pinned_queries_rel',
            [
                'QueryID' => $this->queryID,
                'PinnedBy' => $user->getId(),
            ]
        );
    }

    public function share(\User $user) {
        $DB = $this->loris->getDatabaseConnection();
        $DB->insertIgnore('dataquery_shared_queries_rel',
            [
                'QueryID' => $this->queryID,
                'SharedBy' => $user->getId(),
            ]
        );

    }

    public function unshare(\User $user) {
        $DB = $this->loris->getDatabaseConnection();
        $DB->delete('dataquery_shared_queries_rel',
            [
                'QueryID' => $this->queryID,
                'SharedBy' => $user->getId(),
            ]
        );
    }

    public function setQueryName(\User $user, string $name) {
        $DB = $this->loris->getDatabaseConnection();
        $DB->replace('dataquery_query_names',
            [
                'QueryID' => $this->queryID,
                'UserID' => $user->getId(),
                'Name' => $name,
        ]);

    }

    public function getCriteria() : ?array {
        return $this->data['criteria'] ?? null;
    }

    public function getFields() : ?array {
        return $this->data['fields'] ?? null;
    }

    /*
    public function getQueryDataProvisioner() {
        return new QueryDataProvisioner($this->loris, $this);
    }
    */

    public function newRun(\User $user) : QueryRun {
        $DB = $this->loris->getDatabaseConnection();
        $DB->insert(
            "dataquery_run_queries",
            [
                'QueryID' => $this->queryID,
                'UserID' => $user->getId(),

            ]
        );
        $queryRunID = $DB->getLastInsertId();

        return new QueryRun($this->loris, $this, $queryRunID);
    }

    public function setAdminPinnedQuery(\User $user, string $name, string $type) {
        $DB = $this->loris->getDatabaseConnection();
        $DB->replace('dataquery_study_queries_rel',
            [
                'QueryID' => $this->queryID,
                'PinnedBy' => $user->getId(),
                'Name' => $name,
                'PinType' => $type,
            ]
        );
    }
    public function removeAdminPinnedQuery(string $type) {
        $DB = $this->loris->getDatabaseConnection();
        $DB->delete('dataquery_study_queries_rel',
            [
                'QueryID' => $this->queryID,
                'PinType' => $type,
            ]
        );
    }

    public function matchCandidates(\User $user) : iterable {
        if ($this->getCriteria()) {
            throw new \LorisException("Filters not implemented");
        }
        $allCandidates = $this->allCandidates();

        return $this->filterInaccessibleCandidates($allCandidates, $user);
    }

    private function filterInaccessibleCandidates(array $candIDs, \User $user) : iterable {
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
        $candidates = $DB->pselectCol("SELECT * from accesscandidates", []);
        $DB->run("DROP TEMPORARY TABLE accesscandidates");
        return $candidates;
        /*
        return array_map(function($row) {
            return new CandID($row);
        }, $candidates);
        */
    }

    private function allCandidates() : array {
        $db = $this->loris->getDatabaseConnection();
        $results = $db->pselectCol("SELECT CandID FROM candidate WHERE Active='Y' ORDER BY CandID ", []);

        return array_map(function($row) {
            return new CandID($row);
        }, $results);
    }
}
