<?php
namespace LORIS\Middleware;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use \Psr\Http\Message\URIInterface;
use \LORIS\Http\ServerResponse;
use \LORIS\Http\StringStream;
use \LORIS\Http\FileStream;
use \LORIS\Http\EmptyStream;
trait MiddlewareChainerMixin {
    /**
     * The next middleware in this chain. This should be
     * protected, but since this is a mixin, we get errors about
     * not being able to access it in the mixin functions defined
     * below if it's anything other than public, unfortunately.
     * @internal
     */
    public $next = null;

    /**
     * Appends a middleware to the end of this middleware chain.
     */
    public function withMiddleware(MiddlewareChainer $next) :MiddlewareChainer {
        $new = clone $this;
        $cur = $new;

        while($cur->next !== null) {
            $cur->next = clone $cur->next;
            $cur = $cur->next;

        }

        // We know next is null from the above loop, so this is safe.
        $cur->next = $next;
        return $new;
    }
};
