<?php
namespace LORIS\Middleware;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use \Psr\Http\Message\URIInterface;
use \LORIS\Http\ServerResponse;
use \LORIS\Http\StringStream;
use \LORIS\Http\FileStream;
use \LORIS\Http\EmptyStream;

class ETag implements Middleware, MiddlewareChainer
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
        $body = $response->getBody();
        if ($body->isSeekable()) {
            $etag = sha1($body->__toString());
            $body->rewind();
            $response = $response->withHeader("ETag", "$etag");
            $oldetag = $request->getHeaderLine("If-None-Match");
            if ($oldetag === $etag) {
                $response = $response->withStatus(304);
                $response = $response->withBody(new EmptyStream());
            }
        }
        return $response;
    }
}
