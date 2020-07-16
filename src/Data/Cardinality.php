<?php
namespace LORIS\Data;
/**
 * Cardinality represents the number of data points which
 * apply to the scope of a data type.
 *
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class Cardinality implements \JsonSerializable {
    // Valid cardinality types for data to apply to.

    /**
     * A Unique Cardinality signifies that the data is unique
     * across the scope. Examples of unique data are CandID
     * for the candidate scope or VisitLabel for the Session
     * scope.
     */
    const Unique = 1;

    /**
     * A Single Cardinality signifies that each data point in
     * the scope should have exactly one value. For instance,
     * date of birth for a candidate in the candidate scope.
     */
    const Single = 2;

    /**
     * An Optional Cardinality signifies that each data point
     * in the scope may have zero or one value. For instance,
     * the date of death for a candidate in the candidate scope.
     */
    const Optional= 3;

    /**
     * A Many Cardinality signifies that each data point will
     * have zero or more values associated. For instance,
     * the T1 scans acquired at a session.
     */
    const Many = 4;

    protected $cardinality;

    /**
     * Constructs a Scope object. $scope should be a class constant
     * to construct the scope for, not an int literal.
     *
     * @param int $scope The scope 
     */
    public function __construct(int $card) {
        switch($card) {
        case self::Unique: // fallthrough
        case self::Single: // fallthrough
        case self::Optional: // fallthrough
        case self::Many: // fallthrough
            $this->cardinality = $card;
            break;
        default:
            throw new \DomainException("Invalid cardinality");
        }
    }

    /**
     * Convert the enumeration from a memory-friendly integer to a
     * human-readable string when used in a string context.
     *
     * @return string 
     */
    public function __toString() : string {
        switch($this->cardinality) {
        case self::Unique: // fallthrough
            return "unique";
        case self::Single: // fallthrough
            return "single";
        case self::Optional: // fallthrough
            return "optional";
        case self::Many: // fallthrough
            return "many";
        default:
            return "invalid cardinality";
        }
    }

    public function jsonSerialize() {
        return $this->__toString();
    }
}
