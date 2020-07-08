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
interface Type extends \JsonSerializable {
    public function __toString();
    public function asSQLType();
}
