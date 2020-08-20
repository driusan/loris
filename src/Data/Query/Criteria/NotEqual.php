<?php

namespace LORIS\Data\Query\Criteria;

class NotEqual {
    public function __construct($val) {
        $this->val = $val;
    }

    public function getValue() {
        return $this->val;
    }
}
