<?php declare(strict_types=1);
namespace LORIS\Data\Query;

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
class NullQueryEngine implements QueryEngine {
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
    public function getCandidateData(array $items, array $candidates, ?array $visitlist) : iterable {
        return [];
    }

    /**
     * Get the list of visits at which a DictionaryItem is valid
     */
    public function getVisitList(\LORIS\Data\Dictionary\Category $inst, \LORIS\Data\Dictionary\DictionaryItem $item) : iterable {
        return [];
    }
}
