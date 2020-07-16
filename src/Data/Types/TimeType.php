<?php
namespace LORIS\Data\Types;
/**
 * A TimeType represents a time of the day. (ie. 12pm.)
 *
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class TimeType implements \LORIS\Data\Type {
    public function __toString() {
        return "time";
    }

    public function jsonSerialize() {
        return $this->__toString();
    }
    public function asSQLType() {
        return "varchar(255)";
    }
}
