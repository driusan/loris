<?php
namespace LORIS\dqt;
use \LORIS\StudyEntities\Candidate\CandID;

class QueryRun implements \LORIS\StudyEntities\AccessibleResource,
    \LORIS\Data\DataInstance {
    protected int $runID;
    public function __construct(protected \LORIS\LorisInstance $loris, protected Query $query, ?int $RunID=null,
        public readonly string $runTime='',
        public readonly bool $starred=false,
        public readonly bool $shared=false) {
        if ($RunID !== null) {
            $this->runID = $RunID;
        }
    }

    public function isAccessibleBy(\User $user) : bool {
        // FIXME: validate all fields and modules
        // are accessible
        return true;
    }

    public function getQuery() : Query {
        return $this->query;
    }

    public function insertCandidates(\User $user) : void {
        $DB = $this->loris->getDatabaseConnection();
        $candIDs = $this->query->matchCandidates($user);
        if (count($candIDs) == 0) {
            return;
        }
        $insertstmt = "INSERT INTO dataquery_run_results (RunID, CandID) VALUES ($this->RunID, " . join("),($this->RunID, ", $candIDs) . ')';
        $q = $DB->prepare($insertstmt);
        $q->execute([]);
        return;
    }

    public function getQueryDataProvisioner() {
        return new QueryDataProvisioner($this->loris, $this);
    }

    public function getCandidates() : array {
        $DB = $this->loris->getDatabaseConnection();
        $candIDs = $DB->pselectCol("SELECT CandID FROM dataquery_run_results WHERE RunID=:run", ['run' => $this->RunID]);

        return array_map(function ($val) {
            return new CandID($val);
        }, $candIDs);

    }

    public function jsonSerialize() : mixed {
        $result = [
            'RunTime' => $this->runTime,
            'Query' => $this->query,
        ];
        return $result;
    }
}
?>
