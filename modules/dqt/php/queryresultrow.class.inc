<?php
namespace LORIS\dqt;

class QueryResultRow implements \LORIS\Data\DataInstance {
    public function jsonSerialize() : mixed {
        return 'fake data';
    }
}
