<?php
namespace LORIS\Http;
use \Psr\Http\Message\UriInterface;
use \Psr\Http\Message\RequestInterface;

/**
 * A ClientRequest represents an outgoing request from a client.
 * That is, it represents that request as it's sent over the wire,
 * before the server receives it and adds the PHP superglobals.
 */
class ClientRequest extends HttpMessage implements \Psr\Http\Message\RequestInterface {
    protected $target = "/";
    protected $uri;
    protected $method = 'GET';
    public function getRequestTarget() {
        return $this->target;
    }

    public function withRequestTarget($requestTarget) {
        $new = clone $this;
        $new->target = $requestTarget;
        return $new;
    }

    public function withMethod($method) {
        $new = clone $this;
        $new->method = $method;
        return $new;
    }

    public function getMethod() {
        return $this->method;
    }

    public function getUri() {
        return $this->uri;
    }

    public function withUri(URIInterface $uri, $preservehost = false) {
        $new = clone $this;
        if ($preservehost === false) {
            $new = $new->withHeader("Host", $uri->getHost());
        }
        $new->uri = $uri;
        $new->target = $uri->getPath();
        if (!empty($uri->getQuery())) {
            $new->target .= "?" . $uri->getQuery();
        }

        return $new;
    }

    /**
     * @internal
     * @todo Move this to a PSR17 factory implementation
     */
    public static function fromGlobals() {
        $val = new ClientRequest();
        if (!empty($_SERVER['REQUEST_METHOD'])) {
            $val = $val->withMethod($_SERVER['REQUEST_METHOD']);
        }
        if (!empty($_SERVER['SERVER_PROTOCOL'])) {
            $val = $val->withProtocolVersion(substr($_SERVER['SERVER_PROTOCOL'], 5));
        }
        $uri = URI::fromGlobals();
        $val = $val->withUri($uri);
        $headers = apache_request_headers();
        if ($headers !== false) {
            foreach ($headers as $header => $hval) {
                $val = $val->withAddedHeader($header, $hval);
            }
        }
        return $val;
    }

    /**
     * The PSR7 standard doesn't specify how a RequestInterface should serialize to
     * a string. To aid in debugging, this serializes it in the same format that
     * the request is sent over the wire in an HTTP request.
     *
     * This should not be depended upon, and users of this class should use the
     * appropriate interfaces as defined in PSR7.
     *
     * @internal 
     */
    public function __toString() {
        // The first GET /foo HTTP/1.1 line.
        $val = $this->getMethod();
        $val .= " " . $this->getRequestTarget();
        $val .= " HTTP/" . $this->getProtocolVersion() . "\n";

        // The parent serializes all the headers.
        $val .= parent::__toString();
        return $val;
    }
}
