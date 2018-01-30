<?php
namespace LORIS\Middleware;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use \Psr\Http\Message\URIInterface;
use \Psr\Http\Server\MiddlewareInterface;
use \Psr\Http\Server\RequestHandlerInterface;
use \LORIS\Http\EmptyStream;

class ResponseGenerator implements MiddlewareInterface, MiddlewareChainer {
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ) : ResponseInterface {
        $response = $handler->handle($request);

        if ($response->getBody() == null) {
            // If there was no body attached from the handler, attach an empty
            // one
            return $response->withBody(new EmptyStream());
        }
        return $response;
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
