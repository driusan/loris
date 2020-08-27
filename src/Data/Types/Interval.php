<?php
namespace LORIS\Data\Types;
/**
 * An Interval data type represents a time interval or duration.
 *
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class Interval implements \LORIS\Data\Type {
    public function __toString() {
        return "interval";
    }

    public function jsonSerialize() {
        return $this->__toString();
    }
    public function asSQLType() : string {
        return "varchar(255)";
    }
}
