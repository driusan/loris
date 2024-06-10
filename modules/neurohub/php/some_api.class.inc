<?php declare(strict_types=1);
namespace LORIS\neurohub;
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
class some_api extends \LORIS\Http\Endpoint
{
    public function _hasAccess(\User $user) : bool
    {
        // XXX: Add permission checks here if necessary.
        return true;
    }
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        // XXX: Do something with the incoming request here.
        return new \LORIS\Http\Response\JSON\OK(["success" => "Alright."]);
    }
}