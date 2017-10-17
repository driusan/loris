<?php
namespace LORIS\Middleware;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use \Psr\Http\Message\URIInterface;
use \LORIS\Http\ServerResponse;
use \LORIS\Http\StringStream;
use \LORIS\Http\FileStream;
use \LORIS\Http\EmptyStream;
interface MiddlewareChainer {
    /**
     * @return MiddlwareChainer|null
     */
    //public function nextMiddleware();

    /**
     * @return MiddlewareChainer
     */
    public function withMiddleware(MiddlewareChainer $next) : MiddlewareChainer;
}
