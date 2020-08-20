<?php

namespace LORIS\Data\Query\Criteria;

class Equal {
    public function __construct($val) {
        $this->val = $val;
    }

    public function getValue() {
        return $this->val;
    }
}
