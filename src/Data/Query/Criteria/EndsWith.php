<?php

namespace LORIS\Data\Query\Criteria;

class EndsWith implements \LORIS\Data\Query\Criteria {
    public function __construct($val) {
        $this->val = $val;
    }

    public function getValue() {
        return $this->val;
    }
}