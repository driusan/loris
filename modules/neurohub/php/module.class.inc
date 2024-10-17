<?php declare(strict_types=1);
namespace LORIS\neurohub;

/**
 * Module descriptor class for the neurohub module.
 */
class Module extends \Module
{
    public function getLongName() : string
    {
        return "NeuroHub/LORIS Integration";
    }

    /**
     * @return \LORIS\GUI\Widget[]
     */
    public function getWidgets(string $type, \User $user, array $options)
    {
        switch ($type) {
        case 'userpreference':
            return [
                new NeuroHubTokenWidget(
		    $this->loris,
                    "Neurohub Token",
                    "/neurohub/js/widgets.js",
                    "lorisjs.neurohub.widgets.NeurohubTokenPreference",
                    []
                ),
            ];
        case 'dataquery:action':
            return [
                new \LORIS\dataquery\ActionWidget(
                    "Test Widget",
                    "info",
                    "/neurohub/js/widgets.js",
                    "lorisjs.neurohub.widgets.NeurohubDataqueryCallback"
                ),
            ];
        default:
            return [];
        }
    }
}

