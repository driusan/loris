<?php declare(strict_types=1);
namespace LORIS\my_preferences;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

/**
 * This class is an example API endpoint for the module. It
 * handles incoming requests to the module url LORIS/neurohub/some_api
 * and returns JSON.
 *
 * You may copy/rename it as necessary, or if not required delete
 * it.
 */
class Widgets extends \LORIS\Http\Endpoint
{
    public function _hasAccess(\User $user) : bool
    {
        return true;
    }
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
	$user = $request->getAttribute("user");
	switch($request->getMethod()) {
	case 'GET':
		$widgets = [];
		$modules = $this->loris->getActiveModules();
		foreach ($modules as $module) {
			if ($module->hasAccess($user)) {
				$mwidgets = $module->getWidgets(
					'userpreference',
					$user,
					[],
				);
				foreach ($mwidgets as $widget) {
					if (!($widget instanceof UserPreferenceWidget)) {
						continue;
					}
					$widgets[] = $widget;
				}
			}
		}
		return new \LORIS\Http\Response\JSON\OK($widgets);
	default:
		return new \LORIS\Http\response\JSON\MethodNotAllowed(['GET']);
	}
    }
}
