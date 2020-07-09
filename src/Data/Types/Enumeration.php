<?php
namespace LORIS\Data\Types;
/**
 * A Scope represents the scope that a DataPoint applies to.
 *
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class Enumeration implements \LORIS\Data\Type {
    protected $options = [];

    public function __construct(string ...$values) {
        $this->options = $values;
    }

    public function __toString() {
        return join(";", $this->options);
    }

    public function jsonSerialize() {
        return $this->__toString();
    }
    public function asSQLType() {
        // FIXME: Escape options
        return "enum(" . join(",", $this->options) . ")";
    }
}
