<?php
namespace LORIS\Middleware;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use \Psr\Http\Message\URIInterface;
use \LORIS\Http\ServerResponse;
use \LORIS\Http\StringStream;
use \LORIS\Http\FileStream;
use \LORIS\Http\EmptyStream;

class ContentLength implements Middleware, MiddlewareChainer
{
    use MiddlewareChainerMixin;
    public function __construct($next = null) {
      $this->next = $next;
    }
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ) {
        $response = $this->next->process($request, $handler);
        $contentlength = $response->getBody()->getSize();
        if ($contentlength !== null) {
            return $response->withHeader("Content-Length", "$contentlength");
        }
        return $response;
    }
}
