<?php

namespace LORIS\Data\Query\Criteria;

class IsNull implements \LORIS\Data\Query\Criteria {
    public function __construct() {
    }

    public function getValue() {
        return null;
    }
}