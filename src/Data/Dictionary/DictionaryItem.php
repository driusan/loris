<?php
declare(strict_types=1);
namespace LORIS\Data\Dictionary;
use \LORIS\Data\Scope;
use \LORIS\Data\Type;
use \LORIS\Data\Cardinality;

/**
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class DictionaryItem implements \LORIS\StudyEntities\AccessibleResource
{
    protected $name;
    protected $description;
    protected $scope;
    protected $typ;

    /**
     * Construct a DictionaryItem with the given parameters
     *
     * @param string $name   The field name of the dictionary item
     * @param string $desc   The dictionary item's description
     * @param Scope  $scope  The scope to which this DictionaryItem applies
     * @param Type   $t      The data type of this dictionary item
     * @param Cardinality $c The data cardinality
     */
    public function __construct(string $name, string $desc, Scope $scope, Type $t, Cardinality $c)
    {
        $this->name        = $name;
        $this->description = $desc;
        $this->scope = $scope;
        $this->typ = $t;
        $this->cardinality = $c;
    }

    public function getName() : string
    {
        return $this->name;
    }

    public function getDescription() : string
    {
        return $this->description;
    }

    public function getScope() : Scope {
        return $this->scope;
    }

    public function getDataType() : \LORIS\Data\Type {
        return $this->typ;
    }

    public function getCardinality() : \LORIS\Data\Cardinality {
        return $this->cardinality;
    }

    /**
     * The DictionaryItem instance implements the AccessibleResource
     * interface in order to make it possible to restrict items per
     * user. However, by default DictionaryItems are accessible by
     * all users. In order to restrict access to certain items, a
     * module would need to extend this class and override the
     * isAccessibleBy method with its prefered business logic.
     *
     * @param \User $user The user whose access should be
     *                    validated
     *
     * @return bool
     */
    public function isAccessibleBy(\User $user): bool {
        return true;
    }
}
