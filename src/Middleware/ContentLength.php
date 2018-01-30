<?php
namespace LORIS\Middleware;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use \Psr\Http\Message\URIInterface;
use \Psr\Http\Server\MiddlewareInterface;
use \Psr\Http\Server\RequestHandlerInterface;
use \LORIS\Http\ServerResponse;
use \LORIS\Http\StringStream;
use \LORIS\Http\FileStream;
use \LORIS\Http\EmptyStream;

class ContentLength implements MiddlewareInterface, MiddlewareChainer
{
    use MiddlewareChainerMixin;
    public function __construct($next = null) {
      $this->next = $next;
    }
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ) : ResponseInterface {
        $response = $this->next->process($request, $handler);
        $contentlength = $response->getBody()->getSize();
        if ($contentlength !== null) {
            return $response->withHeader("Content-Length", "$contentlength");
        }
        return $response;
    }
}
