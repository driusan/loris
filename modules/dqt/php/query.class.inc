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

    public function getCriteria() : ?array {
        return $this->data['criteria'] ?? null;
    }

    public function getFields() : ?array {
        return $this->data['fields'] ?? null;
    }

    public function getQueryDataProvisioner() {
        return new QueryDataProvisioner($this->loris, $this);
    }
}
?>
