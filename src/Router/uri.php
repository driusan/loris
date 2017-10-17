<?php
namespace LORIS\Router;

// Handles the root of a LORIS install. It will mostly delegate to the
// module router.
class LORISBaseRouter extends Prefix implements RequestHandlerInterface {
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
            $mr = new LORIS1ModuleRouter($modulename, $this->moduledir);
            return $mr->handle($request->withURI($suburi));
        }
        return new ServerResponse(404, new StringStream($components[0]));
    }
}

class LORIS1ModuleRouter extends PrefixRouter {
    protected $module = "";
    public function __construct($module, $moduledir) {
        parent::__construct(new \ArrayIterator([
            "/css/" => new LORIS1ModuleFileRouter($module, $moduledir, "css"),
            "/js/" => new LORIS1ModuleFileRouter($module, $moduledir, "js"),
            "/static/" => new LORIS1ModuleFileRouter($module, $moduledir, "static"),
        ]
        ));
    }

    public function handle(ServerRequestInterface $request) : ResponseInterface {
        // FIXME: Handle Module->loadPage if the parent is a 404.
        return parent::handle($request);
    }


}

class LORIS1ModuleFileRouter implements RequestHandlerInterface {
    protected $module;
    protected $subdir;

    public function __construct($module, $moduledir, $subdir) {
        $this->module = $module;
        $this->moduledir = $moduledir;
        $this->subdir = $subdir;
    }
    public function handle(ServerRequestInterface $request) : ResponseInterface {
        $fullpath = $this->moduledir . "/" . $this->module . "/" . $this->subdir . "/" . $request->getURI()->getPath();

        if (is_file($fullpath)) {
            return (new ServerResponse(200, new FileStream($fullpath)));
        }
        return new ServerResponse(404, new StringStream($fullpath . ": File not found"));
    }
}
