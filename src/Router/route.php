<?php
/**
 * This part is LORIS2 router framework until noted otherwise.
 */
interface Router {
    public function Handle(RequestInterface $request) : ResponseInterface
}

/**
 * A PrefixRouter maps a prefix to a router. It acts as a middleware that strips
 * the prefix from the router, so that the module at that prefix is unaware of it
 * being relative on the server, and the prefix router middleware will re-add the
 * prefix after handling the request.
 *
 * Add Iterator interface to implementation?
 */
class PrefixRouter implements Router {
    /* @var Traversable list of routes handled by this router. */
    protected $routes;

    /**
     * Array of form [prefix => Route, prefix2 => Route2..]
     * First one wins.
     */
    function __construct(Traversable $routes) : Route {
        $this->routes = $routes;
    }
    public function Handle(RequestInterface) : ResponseInterface {
        foreach($this->routes as $path => $route) {
            if ($request->hasPrefix($path)) {
                // Add closure that strips prefix and re-adds it afterwards
                // here.
                return $route;
            }
        }
        throw new Exception("Bad request");
    }

}

// Same as PrefixRouter, but doesn't strip/readd the prefix path once it finds a match.
class AbsoluteRouter implements Router {
}

// Must be exact match. (Avoids foreach loop -- constant time overhead.)
// TODO: Implement this.
class MapRouter implements Router {

}

class MethodDispatchRouter implements Router {
    public function Handle(RequestInterface) : ResponseInterface {
        // switch on method type and call HandleX for HTTP method X here.
        // FIXME: This shouldn't be a router. Maybe a HandleMethod mixin instead?
    }

}

/**
 * This part is LORIS2-NeuroDB implementation/LORIS1 backport.
 */
// LORISRouter is a specific type of prefix router. It automatically adds
// the following routes:
// Add the following to $this->routes:
// Check if module, if so return module router.
//  -> Implement in \LORIS\Module class for transition
// Check if instrument, if so return instrument router.
//  -> Implement in \LORIS\NDB_BVL_Instrument class for transition
// Check if reliability, if so return reliability router.
//  -> Implement in \LORIS\NDB_Reliability class for transition
//  Check/add anything else in .htaccess here.
//  CandID
//  CandID/VisitLabel
//  CandID/VisitLabel/Instrument
//  /preferences <-- why?
//  /password-reset  <-- removed with public modules.
//  /request-account <-- removed with public modules.
//
class LORISRouter extends PrefixRouter {
    function __construct() { 
        // build routes described above here based on filesystem
        // parent::__construct($routes)
    }

    // Inherited?
    function Handle(RequestInterface) : ResponseInterface {
    }
}

// Autohandle:
//  /css
//  /js
//  /static
//  /ajax
//  /pagename for a subpage
//  Add authentication middleware
class LORIS1ModuleRouter extends PrefixRouter {
    function Handle(RequestInterface) : ResponseInterface {
    }
}

// Handle an instrument, strip the prefix, and delegate to NDB_BVL_Instrument.
// Add authentication middleware
class LORIS1InstrumentRouter implements Router {
}

// handles an API request.
// Authentication middleware.
class LORISAPIRouter implements Router {
}
?>
