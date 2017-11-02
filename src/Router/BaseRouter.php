<?php
namespace LORIS\Router;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use LORIS\Http\ServerResponse;
use LORIS\Http\StringStream;

// Handles the root of a LORIS install. It will mostly delegate to the
// module router.
// FIXME: Add other things in .htaccess here.
class BaseRouter extends Prefix implements \LORIS\Middleware\RequestHandlerInterface {
    protected $projectdir;
    protected $moduledir;
    public function __construct($projectdir, $moduledir) {
        $this->projectdir = $projectdir;
        $this->moduledir = $moduledir;
    }

    public function handle(ServerRequestInterface $request) : ResponseInterface {
        $uri = $request->getUri();
        $path = $uri->getPath();
        if ($path[0] === "/") {
            $path = substr($path, 1);
            $request = $request->withURI($uri->withPath($path));
        }
        $components = explode("/", $path);
        $modulename = $components[0];
        if (is_dir($this->moduledir . "/" . $modulename)) {
            $uri = $request->getURI();
            $suburi = $this->stripPrefix($modulename, $uri);
            $module = \Module::factory($modulename);
            $mr = new ModuleRouter($module, $this->moduledir);
            return $mr->handle($request->withURI($suburi));
        }
        return new ServerResponse(404, new StringStream("Not Found"));
    }
}
