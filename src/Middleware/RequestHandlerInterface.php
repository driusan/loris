<?php
namespace LORIS\Middleware;
use \Psr\Http\Message\ServerRequestInterface;
// FIXME: This should be from PSR15, not \LORIS\Middleware
interface RequestHandlerInterface
{
    public function handle(ServerRequestInterface $request);
}
