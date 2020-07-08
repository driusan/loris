<?php
namespace LORIS\Data\Types;
/**
 * A Scope represents the scope that a DataPoint applies to.
 *
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class DecimalType implements \LORIS\Data\Type {
    public function __construct() {
    }

    public function __toString() {
        return "decimal";
    }

    public function jsonSerialize() {
        return $this->__toString();
    }
    public function asSQLType() {
        return "decimal";
    }
}
