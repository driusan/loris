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

    public function __construct(string $name, string $desc) {
        $this->name = $name;
        $this->description = $desc;
    }
    public function getName() : string {
        return $this->name;
    }

    public function getDescription() : string {
        return $this->description;
    }
}
