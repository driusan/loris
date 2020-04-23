<?php
namespace LORIS\bvl_feedback;
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
        $threads = new \LORIS\Data\Dictionary\Category(
            "Feedback Threads",
            "BVL Feedback Threads",
        );
        $items   = [
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

        return array_keys(\Utility::getVisitList());
    }
}
