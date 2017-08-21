<?php
namespace LORIS\candidate_list;

class CandidateListRow extends \LORIS\Data\Instance {
    protected $DBRow;
    protected $CenterID;

    public function __construct(array $row, $cid) {
        $this->DBRow = $row;
        $this->CenterID = $cid;
    }

    public function ToArray() : array {
        return $this->DBRow;
    }

    public function getCenterID() {
        return $this->CenterID;
    }
}
