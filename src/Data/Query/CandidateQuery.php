<?php
namespace LORIS\Data\Query;

class CandidateQuery {
    function __construct($dictionary, $criteria) {
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
