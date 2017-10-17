<?php
namespace LORIS\Middleware;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use \Psr\Http\Message\URIInterface;
use \LORIS\Http\ServerResponse;
use \LORIS\Http\StringStream;
use \LORIS\Http\FileStream;
use \LORIS\Http\EmptyStream;

class ResponseGenerator implements Middleware, MiddlewareChainer {
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ) {
        return $handler->handle($request);
    }
    public function nextMiddleware() {
        return null;
    }

    /**
     * @return MiddlewareChainer
     */
    public function withMiddleware(MiddlewareChainer $next) :MiddlewareChainer {
        return $this;
    }
}
