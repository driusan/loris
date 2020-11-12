<?php
namespace LORIS\bvl_feedback;

use LORIS\StudyEntities\Candidate\CandID;

use \LORIS\Data\Dictionary\DictionaryItem;
use \LORIS\Data\Scope;
use \LORIS\Data\Cardinality;
use \LORIS\Data\Query\QueryTerm;

/**
 * {@inheritDoc}
 *
 * @license http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class QueryEngine extends \LORIS\Data\Query\SQLQueryEngine
{
    /**
     * {@inheritDoc}
     *
     * @param \LORIS\LorisInstance $loris The Loris instance from which the
     *                                    data dictionary for this module
     *                                    should be retrieved.
     *
     * @return \LORIS\Data\Dictionary\Category[]
     */
    public function getDataDictionary() : iterable
    {
        $threads = new \LORIS\Data\Dictionary\Category(
            "Feedback Threads",
            "BVL Feedback Threads",
        );
        $items  = [
            new DictionaryItem(
                "SessionThreadStatus",
                "Session Thread Status",
                new Scope(Scope::SESSION),
                new \LORIS\Data\Types\BooleanType(),
                new Cardinality(Cardinality::MANY),
            ),
            new DictionaryItem(
                "CandidateThreadStatus",
                "Candidate Thread Status",
                new Scope(Scope::CANDIDATE),
                new \LORIS\Data\Types\BooleanType(),
                new Cardinality(Cardinality::MANY),
            ),
        ];

        $threads = $threads->withItems($items);

        return [$threads];
    }

    public function getVisitList(\LORIS\Data\Dictionary\Category $inst, \LORIS\Data\Dictionary\DictionaryItem $item) : iterable
    {
        if($item->getScope()->__toString() !== 'session') {
            return null;
        }

        return array_keys(\Utility::getVisitList());
    }

    public function getCandidateMatches(QueryTerm $term, ?array $visitlist=null) : iterable {
        $this->resetEngineState();

        $this->addTable('candidate c');
        $this->addTable('JOIN session s ON (s.CandID=c.CandID)');
        $this->addTable('JOIN files f ON (s.ID=f.SessionID)');

        $this->addWhereClause("s.Active='Y'");
        $this->addWhereClause("c.Active='Y'");

        $prepbindings = [];
        $dict = $term->getDictionaryItem();

        if ($dict instanceof LocationDictionaryItem) {
            $this->addTable("JOIN mri_scan_type mst ON (f.AcquisitionProtocolID=mst.ID)");
            $this->addWhereClause('mst.Scan_type=:mstval');
            $prepbindings['mstval'] = $dict->getModality();
            $this->addWhereCriteria('f.File', $term->getCriteria(), $prepbindings);
        } else if ($dict instanceof QCDictionaryItem) {
            $this->addTable("JOIN mri_scan_type mst ON (f.AcquisitionProtocolID=mst.ID)");
            $this->addWhereClause('mst.Scan_type=:mstval');
            $prepbindings['mstval'] = $dict->getModality();
            $this->addTable('JOIN files_qcstatus fqc ON (fqc.FileID=f.FileID)');
            $this->addWhereCriteria('fqc.QCStatus', $term->getCriteria(), $prepbindings);
        }

        $query = 'SELECT DISTINCT c.CandID FROM';
        $query .= ' ' . $this->getTableJoins();

        $query .= ' WHERE ';
        $query .= $this->getWhereConditions();

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

        $DB = \Database::singleton();
        $rows = $DB->pselectCol($query, $prepbindings);

        return array_map(function($cid) {
            return new CandID($cid);
        }, $rows);

    }

    public function getCandidateData(array $items, array $candidates, ?array $visitlist) : iterable {
        if (count($candidates) == 0) {
            return [];
        }
        $this->resetEngineState();

        $this->addTable('candidate c');
        $this->addWhereClause("c.Active='Y'");

        $DB = $this->loris->getDatabaseConnection();
        $this->createTemporaryCandIDTable($DB, "searchcandidates", $candidates);

        // CandID needed for candidateCombine.
        $fields = ['c.CandID'];
        foreach ($items as $dict) {
            $fields[] = $this->getFieldNameFromDict($dict) . ' as ' . $dict->getName();
        }

        $query = 'SELECT DISTINCT ' . join(', ', $fields) . ' FROM';
        $query .= ' ' . $this->getTableJoins();

        $query .= ' WHERE c.CandID IN (SELECT CandID FROM searchcandidates)';
        $prepbindings = [];
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
        $DB = \Database::singleton();

        $rows = $DB->prepare($query);
        $rows->execute($prepbindings);
        return $this->candidateCombine($items, $rows);
    }

    private function getFieldNameFromDict(\LORIS\Data\Dictionary\DictionaryItem $item) : string {
        switch($item->getName()) {
        case 'SessionThreadStatus':
            $this->addTable("LEFT JOIN session s ON (s.CandID=c.CandID)");
            $this->addTable("LEFT JOIN feedback_bvl_thread bvls ON (s.ID=bvls.SessionID)");
            $this->addWhereClause("s.Active='Y'");
            return 'bvls.Status';
        case 'CandidateThreadStatus':
            $this->addTable("LEFT JOIN feedback_bvl_thread bvlc ON (c.CandID=bvlc.CandID)");
            return 'bvlc.Status';
        default:
            throw new \DomainException("Invalid field " . $dict->getName());
        }
    }

}
