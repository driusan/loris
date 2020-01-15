<?php declare(strict_types=1);

namespace LORIS\module_manager;

/**
 * A ModuleRow represents a row in the module_manager menu table.
 *
 * The module_manager requires a specific "row" concept because
 * the \Module class does not have any concept of the Active flag
 * for the module in order to serialize it as JSON for the data
 * table.
 *
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class ModuleRow implements \LORIS\Data\DataInstance
{
    protected $Module;
    protected $DBRow;
    protected $Active;
    protected $Name;

    /**
     * Create a new ModuleRow Instance.
     *
     * @param array $row The ModuleRow Instance
     */
    public function __construct(\LORIS\LorisInstance $loris, array $row)
    {
        $this->Name = $row['name'];
        try {
            $this->Module = \Module::factory($row['name']);
            $this->Active = $row['active'];
            $this->errors = $this->Module->validateConfiguration($loris);
        } catch (\LorisModuleMissingException $e) {
            $this->errors = ["INVALID MODULE -- " . $e->getMessage()];
        }
    }

    /**
     * Implements \LORIS\Data\DataInstance interface for this row.
     *
     * @return string the instance data.
     */
    public function toJSON(): string
    {
        $name = '';
        if ($this->Module !== null) {
            $name = $this->Module->getLongName();
        }
        return json_encode(
            [
                'Name'     => $this->Name,
                'LongName' => $name,
                'Active'   => $this->Active,
                'Errors'   => $this->errors,
            ]
        );
    }

}
