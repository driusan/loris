<?php
namespace LORIS\Middleware;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use \Psr\Http\Message\URIInterface;
use \LORIS\Http\ServerResponse;
use \LORIS\Http\StringStream;
use \LORIS\Http\FileStream;
use \LORIS\Http\EmptyStream;
// FIXME: This should be from PSR15, not inlined..
interface Middleware
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler);
}
