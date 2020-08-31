<?php
namespace LORIS\Data\Query\Criteria;
use LORIS\Data\Query\Criteria;

class Equal implements Criteria {
    public function __construct($val) {
        $this->val = $val;
    }

    public function getValue() {
        return $this->val;
    }
}
