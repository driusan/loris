<?php
namespace LORIS\imaging_browser;

use \LORIS\Data\Dictionary\DictionaryItem;
use \LORIS\Data\Dictionary\Category;

use \LORIS\Data\Scope;
use \LORIS\Data\Cardinality;

/**
 * {@inheritDoc}
 *
 * @license http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class QueryEngine implements \LORIS\Data\Query\QueryEngine
{
    /**
     * {@inheritDoc}
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
        $items  = [
            new DictionaryItem(
                "ScanDone",
                "Does the candidate have any imaging scan done?",
                $scope,
                new \LORIS\Data\Types\BooleanType(),
                new Cardinality(Cardinality::SINGLE),
            ),
        ];

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

    /**
     * {@inheritDoc}
     *
     * @param Category       $inst The category containing the DictionaryItem.
     * @param DictionaryItem $item The item we want visit lists for.
     *
     * @return iterable
     */
    public function getVisitList(
        \LORIS\Data\Dictionary\Category $inst,
        \LORIS\Data\Dictionary\DictionaryItem $item
    ) : iterable {
        if ($item->getScope()->__toString() !== 'session') {
            return [];
        }

        if ($item instanceof ImagingDictionaryItem) {
            $DB     = \NDB_Factory::singleton()->database();
            $visits = $DB->pselectCol(
                "SELECT DISTINCT s.Visit_label
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
}
