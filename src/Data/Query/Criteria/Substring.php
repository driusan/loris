<?php

namespace LORIS\Data\Query\Criteria;

class Substring {
    public function __construct($val) {
        $this->val = $val;
    }

    public function getValue() {
        return $this->val;
    }
}
