<?php

namespace LORIS\Data\Query;

class EndsWithCriteria {
    public function __construct($val) {
        $this->val = $val;
    }

    public function getValue() {
        return $this->val;
    }
}
