<?php
namespace LORIS\Data\Types;
/**
 * A Scope represents the scope that a DataPoint applies to.
 *
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class StringType implements \LORIS\Data\Type {
    private $size;

    public function __construct(?int $maxsize=null) {
        $this->size = $maxsize;
    }

    public function __toString() {
        return "string";
    }

    public function jsonSerialize() {
        return $this->__toString();
    }
    public function asSQLType() {
        if($this->size === null){
            return "text";
        }
        return "varchar($this->size)";
    }
}
