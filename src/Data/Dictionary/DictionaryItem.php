<?php
declare(strict_types=1);
namespace LORIS\Data\Dictionary;

/**
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class DictionaryItem
{
    protected $name;
    protected $category;
    protected $description;

    public function __construct(string $name, string $desc, Category $cat) {
        $this->name = $name;
        $this->category = $cat;
        $this->description = $desc;
    }

    public function getName() : string {
        return $this->name;
    }

    public function getDescription() : string {
        return $this->description;
    }

    public function getCategory() : Category {
        return $this->category;
    }
}
