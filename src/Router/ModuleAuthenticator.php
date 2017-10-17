<?php
namespace LORIS\Router;
use Psr\Http\Message\ServerRequestInterface;

// FIXME: This shouldn't be in the middleware namespace. There
// should be a LORIS authentication framework.
class ModuleAuthenticator implements \LORIS\Middleware\Authenticator {
    public function authenticate(ServerRequestInterface $request) : bool {
        return true;
    }
}
