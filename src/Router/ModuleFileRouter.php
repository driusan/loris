<?php
namespace LORIS\Router;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use LORIS\Http\ServerResponse;
use LORIS\Http\FileStream;


class ModuleFileRouter implements \LORIS\Middleware\RequestHandlerInterface {
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
