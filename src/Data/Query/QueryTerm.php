<?php
namespace LORIS\Data\Query;

class QueryTerm {
    function __construct(\LORIS\Data\Dictionary\DictionaryItem $dictionary, Criteria $criteria) {
        $this->dictionary = $dictionary;
        $this->criteria= $criteria;
    }

    public function getDictionaryItem() {
        return $this->dictionary;
    }

    public function getCriteria() {
        return $this->criteria;
    }
}
