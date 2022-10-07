<?php declare(strict_types=1);
namespace LORIS\Data\Query;
use LORIS\Data\Query\Criteria;

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
 * A QueryEngine is an entity which represents a set of data and
 * the ability to query against them.
 *
 * Queries are divided into 2 phases, filtering the data down to
 * a set of CandIDs or SessionIDs, and retrieving the data for a
 * known set of CandID/SessionIDs.
 *
 * There is usually one query engine per module that deals with
 * candidate data.
 */
abstract class SQLQueryEngine implements QueryEngine {
    public function __construct(\LORIS\LorisInstance $loris) {
        $this->loris = $loris;
    }

    /**
     * Return a data dictionary of data types managed by this QueryEngine.
     * DictionaryItems are grouped into categories and an engine may know
     * about 0 or more categories of DictionaryItems.
     *
     * @return \LORIS\Data\Dictionary\Category[]
     */
    public function getDataDictionary() : iterable {
        return [];
    }

    /**
     * Return an iterable of CandIDs matching the given criteria.
     *
     * If visitlist is provided, session scoped variables will only match
     * if the criteria is met for at least one of those visit labels.
     */
    public function getCandidateMatches(QueryTerm $criteria, ?array $visitlist=null) : iterable
    {
        return [];
    }

    /**
     *
     * @param DictionaryItem[] $items
     * @param CandID[] $candidates
     * @param ?VisitLabel[] $visits
     *
     * @return DataInstance[]
     */
    public function getCandidateData(array $items, iterable $candidates, ?array $visitlist) : iterable {
        return [];
    }

    /**
     * Get the list of visits at which a DictionaryItem is valid
     */
    public function getVisitList(\LORIS\Data\Dictionary\Category $inst, \LORIS\Data\Dictionary\DictionaryItem $item) : iterable {
        return [];
    }

    protected function sqlOperator($criteria) {
        if($criteria instanceof LessThan) {
            return '<';
        }
        if($criteria instanceof LessThanOrEqual) {
            return '<=';
        }
        if($criteria instanceof Equal) {
            return '=';
        }
        if($criteria instanceof NotEqual) {
            return '<>';
        }
        if($criteria instanceof GreaterThanOrEqual) {
            return '>=';
        }
        if($criteria instanceof GreaterThan) {
            return '>';
        }
        if($criteria instanceof In) {
            return 'IN';
        }
        if($criteria instanceof IsNull) {
            return "IS NULL";
        }
        if($criteria instanceof NotNull) {
            return "IS NOT NULL";
        }

        if($criteria instanceof StartsWith) {
            return "LIKE";
        }
        if($criteria instanceof EndsWith) {
            return "LIKE";
        }
        if($criteria instanceof Substring) {
            return "LIKE";
        }
        throw new \Exception("Unhandled operator: " . get_class($criteria));
    }

    protected function sqlValue($criteria, array &$prepbindings) {
        static $i = 1;

        if($criteria instanceof In) {
            $val = '(';
            $critvalues= $criteria->getValue();
            foreach($critvalues as $critnum => $critval) {
                $prepname = ':val' . $i++;
                $prepbindings[$prepname] = $critval;
                $val .= $prepname;
                if ($critnum != count($critvalues)-1) {
                    $val .= ', ';
                }
            }
            $val .= ')';
            return $val;
        }

        if($criteria instanceof IsNull) {
            return "";
        }
        if($criteria instanceof NotNull) {
            return "";
        }

        $prepname = ':val' . $i++;
        $prepbindings[$prepname] = $criteria->getValue();

        if($criteria instanceof StartsWith) {
            return "CONCAT($prepname, '%')";
        }
        if($criteria instanceof EndsWith) {
            return "CONCAT('%', $prepname)";
        }
        if($criteria instanceof Substring) {
            return "CONCAT('%', $prepname, '%')";
        }
        return $prepname;
    }

    private $tables;

    protected function addTable(string $tablename) {
        if(isset($this->tables[$tablename])) {
            // Already added
            return;
        }
        $this->tables[$tablename] = $tablename;
    }

    protected function getTableJoins() : string {
        return join(' ', $this->tables);
    }

    private $where;
    protected function addWhereCriteria(string $fieldname, Criteria $criteria, array &$prepbindings) {
        $this->where[] = $fieldname . ' ' 
            . $this->sqlOperator($criteria) . ' ' 
            . $this->sqlValue($criteria, $prepbindings);
    }

    protected function addWhereClause(string $s) {
        $this->where[] = $s;
    }

    protected function getWhereConditions() : string {
        return join(' AND ', $this->where);
    }

    protected function resetEngineState() { 
        $this->where = [];
        $this->tables = [];
    }

    protected function candidateCombine(iterable $dict, iterable $rows) {
        $lastcandid = null;
        $candval = [];

        error_log("1");
        // foreach ($rows as $row) {
        foreach ($rows as $row) {
            if($lastcandid !== null && $row['CandID'] !== $lastcandid) {
                yield $lastcandid => $candval;
                $candval = [];
            }
            $lastcandid = $row['CandID'];
            foreach($dict as $field) {
                $fname = $field->getName();
                if ($field->getScope() == 'session'
                    || $field->getCardinality()->__toString() == 'many') {

                    if (!isset($candval[$fname])) {
                        $candval[$fname] = [];
                    }
                    if (!in_array($row[$fname], $candval[$fname])
                        && $row[$fname] !== null
                    ) {
                        $candval[$fname][] = $row[$fname];
                    }
                } else {
                    $candval[$fname] = $row[$fname];
                }
            }
        }
        // $rows->close();
        if (!empty($candval)) {
            yield $lastcandid => $candval;
        }
    }

    protected function createTemporaryCandIDTable($DB, string $tablename, array $candidates) {
        // Put candidates into a temporary table so that it can be used in a join
        // clause. Directly using "c.CandID IN (candid1, candid2, candid3, etc)" is
        // too slow.
        $DB->run("DROP TEMPORARY TABLE IF EXISTS $tablename");
        $DB->run("CREATE TEMPORARY TABLE $tablename (
            CandID int(6)
        );");
        $insertstmt = "INSERT INTO $tablename VALUES (" . join('),(', $candidates) . ')';
        $q = $DB->prepare($insertstmt);
        $q->execute([]);
    }

    protected function createTemporaryCandIDTablePDO($PDO, string $tablename, array $candidates) {
        $query = "DROP TEMPORARY TABLE IF EXISTS $tablename";
        $result = $PDO->exec($query);

        if ($result === false) {
            throw new DatabaseException(
                "Could not run query $query"
                . $this->_createPDOErrorString()
            );
        }

        $query = "CREATE TEMPORARY TABLE $tablename (
            CandID int(6)
        );";
        $result = $PDO->exec($query);

        if ($result === false) {
            throw new DatabaseException(
                "Could not run query $query"
                . $this->_createPDOErrorString()
            );
        }

        $insertstmt = "INSERT INTO $tablename VALUES (" . join('),(', $candidates) . ')';
        $q = $PDO->prepare($insertstmt);
        $q->execute([]);
    }

    protected $useBufferedQuery = false;
    public function useQueryBuffering(bool $buffered) {
        $this->useBufferedQuery = $buffered;
    }
}
