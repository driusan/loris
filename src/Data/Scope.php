<?php
namespace LORIS\Data;
/**
 * A Scope represents the scope that a DataPoint applies to.
 *
 *
 * @category   Data
 * @package    Main
 * @subpackage Data
 * @author     Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
class Scope implements \JsonSerializable {
    // Valid scopes for data to apply to.
    const Project   = 1;
    const Candidate = 2;
    const Session   = 3;

    protected $scope;

    /**
     * Constructs a Scope object. $scope should be a class constant
     * to construct the scope for, not an int literal.
     *
     * @param int $scope The scope 
     */
    public function __construct(int $scope) {
        switch($scope) {
        case self::Candidate: // fallthrough
        case self::Project: // fallthrough
        case self::Session:
            $this->scope = $scope;
            break;
        default:
            throw new \DomainException("Invalid scope");
        }
    }

    /**
     * Convert the enumeration from a memory-friendly integer to a
     * human-readable string when used in a string context.
     *
     * @return string 
     */
    public function __toString() : string {
        switch($this->scope) {
        case self::Candidate:
            return "candidate";
        case self::Project:
            return "project";
        case self::Session:
            return "session";
        default:
            // This shouldn't happen since the constructor threw an
            // exception for an invalid value.
            return "invalid scope";
        }
    }

    public function jsonSerialize() {
        return $this->__toString();
    }
}
