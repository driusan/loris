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
class Notifications extends \LORIS\Http\Endpoint
{
    public function _hasAccess(\User $user) : bool
    {
        return true;
    }
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
	$user = $request->getAttribute("user");

	return new \LORIS\Http\Response\JSON\OK([
		'services' => \NDB_Notifier::getNotificationServices(), 
		'preferences' => \NDB_Notifier::getUserNotificationModuleServices($user->getId())
	]);
    }
}
