<?php
namespace LORIS\Router;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;


// Handles the root of a LORIS install. It will mostly delegate to the
// module router.
class ModuleRouter extends Prefix {
    protected $module = null;
    public function __construct($module, $moduledir) {
        $this->module = $module;
        parent::__construct(new \ArrayIterator([
            "/css/" => new ModuleFileRouter($module->getName(), $moduledir, "css"),
            "/js/" => new ModuleFileRouter($module->getName(), $moduledir, "js"),
            "/static/" => new ModuleFileRouter($module->getName(), $moduledir, "static"),
        ]
        ));
    }

    public function handle(ServerRequestInterface $request) : ResponseInterface {
        // FIXME: Add Authentication middleware if the module isn't public.
        if($this->module->isPublicModule() !== true) {
            $parentHandler = parent::handle($request);
            // FIXME: This is stupid, but I can't figure out a way to pass
            // parent to ->process directly.
            $handlingClosure = (new class($parentHandler) extends \LORIS\Http\ServerResponse implements \LORIS\Middleware\RequestHandlerInterface, ResponseInterface {
                private $response;
                function __construct($response) {
                    $this->response = $response;
                }
                function handle(ServerRequestInterface $request) : ResponseInterface{
                    return $this->response;
                }
            });
            return (new \LORIS\Middleware\AuthMiddleware(new ModuleAuthenticator()))->withMiddleware(new \LORIS\Middleware\ResponseGenerator())->process($request, $handlingClosure);
        }
        // FIXME: Handle Module->loadPage if the parent is a 404.
        return parent::handle($request);
    }
}
