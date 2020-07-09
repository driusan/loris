<?php
declare(strict_types=1);
namespace LORIS\Data\Dictionary;

/**
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class Category
{
    protected $name;
    protected $description;
    protected $items = null;

    public function __construct(string $name, string $desc, ?iterable $items=null)
    {
        $this->name        = $name;
        $this->description = $desc;
        $this->items = $items;
    }
    public function getName() : string
    {
        return $this->name;
    }

    public function getDescription() : string
    {
        return $this->description;
    }

    public function getItems() : ?iterable {
        return $this->items;
    }

    public function withItems($items) : Category {
        $c = clone($this);
        $c->items = $items;
        return $c;
    }
}
