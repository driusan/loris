<?php

namespace LORIS\dqt;

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
}

?>
