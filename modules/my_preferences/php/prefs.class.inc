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
class Prefs extends \LORIS\Http\Endpoint
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
		return new \LORIS\Http\Response\JSON\OK([
			"First_name" => $user->getData("First_name"),
			"Last_name" => $user->getData("Last_name"),
			"Email" => $user->getEmail(),
			"Language" => $user->getLanguagePreference(),
		]);
	case 'PUT':
		$data = json_decode((string) $request->getBody(), true);
		$DB = $this->loris->getDatabaseConnection();
		$DB->update("users",
			[
				'First_name' => $data['First_name'],
				'Last_name' =>  $data['Last_name'],
				'Real_name' => $data['First_name'] . ' ' . $data['Last_name'],
				'Email' =>$data['Email'],
				'language_preference' => $data['Language'],
			],
			[ 'ID' => $user->getId()]
		);
		return new \LORIS\Http\Response\JSON\OK(['message' => 'Updated preferences']);
	default:
		return new \LORIS\Http\response\JSON\MethodNotAllowed(['GET', 'PUT']);
	}
    }
}
