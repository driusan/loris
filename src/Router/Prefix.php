<?php
namespace LORIS\Router;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\URIInterface;
use Psr\Http\Message\ResponseInterface;
use LORIS\Http\ServerResponse;
use LORIS\Http\StringStream;

class Prefix implements \LORIS\Middleware\RequestHandlerInterface {
    protected $paths;
    public function __construct(\Traversable $paths) {
        $this->paths = $paths;
    }

    protected function hasPrefix($prefix, $uri) {
        $path = $uri->getPath();
        return (strpos($path, $prefix) === 0);
    }

    protected function stripPrefix($prefix, URIInterface $uri) : URIInterface {
        $path = $uri->getPath();
        $newpath = substr($path, strlen($prefix));
        return $uri->withPath($newpath);

    }

    public function handle(ServerRequestInterface $request) : ResponseInterface {
        foreach($this->paths as $path => $subhandler) {
            if ($this->hasPrefix($path, $request->getURI())) {
                // Strip the prefix before passing it to the subhandler.
                $newURI = $this->stripPrefix($path, $request->getURI());
                $request = $request->withURI($newURI);
                return $subhandler->handle($request);
            }
        }
        return new ServerResponse(404, new StringStream("notfound"));
    }
}
