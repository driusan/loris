<?php
namespace LORIS\Middleware;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use \Psr\Http\Message\URIInterface;
use \LORIS\Http\ServerResponse;
use \LORIS\Http\StringStream;
use \LORIS\Http\FileStream;
use \LORIS\Http\EmptyStream;

class AuthMiddleware implements Middleware, MiddlewareChainer {
    use MiddlewareChainerMixin;

    protected $authenticator;
    public function __construct(Authenticator $auth) {
        $this->authenticator = $auth;
    }
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ) {
        if ($this->authenticator->authenticate($request) === true) {
            return $this->next->process($request, $handler);
        }
        return (new ServerResponse(403, new StringStream("Permission Denied")));

    }
}
