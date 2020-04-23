<?php declare(strict_types=1);
namespace LORIS\Data\Query;

/**
 * A NullQueryEngine represents a type of QueryEngine that does not
 * handle any data. It returns an empty dictionary and always returns
 * no results. This is the default for modules that have not implemented
 * a QueryEngine for their data.
 */
class NullQueryEngine implements QueryEngine
{
    /**
     * {@inheritDoc}
     *
     * @return \LORIS\Data\Dictionary\Category[]
     */
    public function getDataDictionary() : iterable
    {
        return [];
    }

    /**
     * {@inheritDoc}
     */
    public function getVisitList(
        \LORIS\Data\Dictionary\Category $inst,
        \LORIS\Data\Dictionary\DictionaryItem $item
    ) : iterable {
        return [];
    }
}
