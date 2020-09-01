<?php
namespace LORIS\imaging_browser;

use LORIS\StudyEntities\Candidate\CandID;

// use \LORIS\Data\Dictionary\DictionaryItem;
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
        $scope  = new Scope(Scope::SESSION);
        $images = new \LORIS\Data\Dictionary\Category(
            "Images",
            "Image Acquisitions",
        );
        $items  = [];

        $scantypes = \Utility::getScanTypeList();
        foreach ($scantypes as $ScanType) {
            $items[] = new LocationDictionaryItem(
                $ScanType,
                "$ScanType acquisition location",
                $scope,
                new \LORIS\Data\Types\URI(),
                new Cardinality(Cardinality::MANY),
                $ScanType,
            );
            // TODO: Investigate adding a file scope instead of having this apply
            // on a session scope with a Many cardinality.
            $items[] = new QCDictionaryItem(
                $ScanType  . "_QCStatus",
                "Quality control status for $ScanType acquisition",
                $scope,
                new \LORIS\Data\Types\Enumeration("Pass", "Fail"),
                new Cardinality(Cardinality::MANY),
                $ScanType,
            );
        }
        $images = $images->withItems($items);

        return [$images];
    }

    public function getVisitList(\LORIS\Data\Dictionary\Category $inst, \LORIS\Data\Dictionary\DictionaryItem $item) : iterable
    {
        if($item->getScope()->__toString() !== 'session') {
            return null;
        }

        if ($item instanceof ImagingDictionaryItem) {
            $DB = \NDB_Factory::singleton()->database();
            $visits = $DB->pselectCol("SELECT DISTINCT s.Visit_label
                FROM files f
                    JOIN session s ON (f.SessionID=s.ID)
                    JOIN candidate c ON (c.CandID=s.CandID)
                    JOIN mri_scan_type mst ON (mst.ID=f.AcquisitionProtocolID)
                WHERE
                    c.Active='Y' AND
                    s.Active='Y' AND
                    mst.Scan_type=:scantype AND
                    c.Entity_Type='Human'
                ORDER BY s.Visit_label",
                ['scantype' => $item->getModality()],
            );
            return $visits;
        }

        // Fall back on all visits if something ends up getting
        // added that we can't derive the modality of.
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

        $this->addTable("JOIN mri_scan_type mst ON (f.AcquisitionProtocolID=mst.ID)");
        $this->addWhereClause('mst.Scan_type=:mstval');
        $prepbindings['mstval'] = $dict->getModality();
        if ($dict instanceof LocationDictionaryItem) {
            $this->addWhereCriteria('f.File', $term->getCriteria(), $prepbindings);
        } else if ($dict instanceof QCDictionaryItem) {
            $this->addTable('JOIN files_qcstatus fqc ON (fqc.FileID=f.FileID)');
            $this->addWhereCriteria('fqc.QCStatus', $term->getCriteria(), $prepbindings);
        } else {
            throw new \Exception("Unknown dictionary type");
        }

        $query = 'SELECT DISTINCT c.CandID FROM';
        $query .= ' ' . $this->getTableJoins();

        $query .= ' WHERE ';
        $query .= $this->getWhereConditions();

        $DB = \Database::singleton();
        $rows = $DB->pselectCol($query, $prepbindings);

        /*
        var_dump($query);
        var_dump($prepbindings);
        var_dump($rows);
        exit;
         */
        return array_map(function($cid) {
            return new CandID($cid);
        }, $rows);

        /*
        "SELECT DISTINCT c.CandID FROM candidate c
            WHERE
                s.Active='Y' AND c.Active='Y'
        "
*/
        // (modality) acquisition location
        //      =
        //      !=
        //      contains/starts/ends missing??
        //         Add Table:
        //            JOIN mri_scan_type mst ON (f.AcquisitionProtocolID=mst.ID) 
        //         Add WHERE: AND f.File OP val
        //             AND mst.Scan_type=typefromdict
        //
        //      exists
        //      does not exist
        //      number of
        //
        //
        // (modality) qc status
        //      =
        //      !=
        //      in
        //      exists
        //      does not exist
        //      number of
        return [];
    }
}
