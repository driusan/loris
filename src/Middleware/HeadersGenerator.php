<?php
/**
 * Implements the HeadersGenerator middleware class
 *
 * PHP Version 7
 *
 * @category Router
 * @package  Middleware
 * @author   Xavier Lecours Boucher <xavier.lecoursboucher@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

namespace LORIS\Middleware;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use \Psr\Http\Server\MiddlewareInterface;
use \Psr\Http\Server\RequestHandlerInterface;

/**
 * A HeadersGenerator middleware is a chainable type of PSR15-based middleware
 * which takes a response, and adds an HTTP headers.
 *
 * It should be called near the top of a middleware chain (after the response
 * is fully created)
 *
 * @category Router
 * @package  Middleware
 * @author   Xavier Lecours Boucher <xavier.lecoursboucher@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
class HeadersGenerator implements MiddlewareInterface, MiddlewareChainer
{
    use MiddlewareChainerMixin;

    /**
     * Process add all the response headers cantained in the ResponseInterface.
     * It also generate the HTTP header according to protocol version, status code,
     * and reason phrase
     *
     * @param ServerRequestInterface  $request The incoming PSR7 request.
     * @param RequestHandlerInterface $handler The PSR15 handler to delegate
     *                                         content and headers generation to.
     *
     * @return ResponseInterface the PSR15 response
     */
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ) : ResponseInterface {
        $response = $this->next->process($request, $handler);
        header(
            "HTTP/" . $response->getProtocolVersion()
            . " " . $response->getStatusCode()
            . " " . $response->getReasonPhrase()
        );

        // Add the headers from the response.
        $headers = $response->getHeaders();
        foreach ($headers as $name => $values) {
            header($name . ': ' . implode(', ', $values));
        }
        return $response;
    }
}
