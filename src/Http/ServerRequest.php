<?php
namespace LORIS\Http;
use \Psr\Http\Message\ServerRequestInterface;

/**
 * A ServerRequest represents a ClientRequest after being received by
 * the server. That it, it encompasses a ClientRequest but also abstracts
 * away PHP features such as $_GET, $_COOKIE, $_FILES, etc.
 */
class ServerRequest extends ClientRequest implements ServerRequestInterface {
    protected $serverParams;
    public function getServerParams() {
        return $this->serverParams;
    }
    public function withServerParams(array $params) {
        $new = clone $this;
        $new->serverParams = $params;
        return $new;
    }
    protected $cookieParams;
    public function getCookieParams() {
        return $this->cookieParams;
    }

    public function withCookieParams(array $cookies) {
        $new = clone $this;
        $new->cookieParams = $cookies;
        return $new;
    }

    protected $queryParams;
    public function getQueryParams() {
        return $this->queryParams;
    }
    public function withQueryParams(array $params) {
        $new = clone $this;
        $new->queryParams = $params;
        return $new;
    }

    public function getUploadedFiles() {
        return $this->files;
    }

    public function withUploadedFiles(array $uploadedFiles) {
        $new = clone $this;
        $new->files = $uploadedFiles;
        return $new;
    }


    protected $parsedbody;
    public function getParsedBody() {
        return $this->parsedbody;
    }

    public function withParsedBody($data) {
        $new = clone $this;
        $new->parsedbody = $data;
        return $new;
    }

    protected $attributes = [];
    public function getAttributes() {
        return $this->attributes;
    }

    public function getAttribute($name, $default=null) {
        if (isset($this->attributes[$name])) {
            return $this->attributes[$name]; 
        }
        return $default;
    }

    public function withAttribute($name, $value) {
        $new = clone $this;
        $new->attributes[$name] = $value;
        return $new;
    }
    public function withoutAttribute($name) {
        $new = clone $this;
        unset($new->attributes[$name]);
        return $new;
    }

    protected function withClientRequest(ClientRequest $client) {
        $new = clone $this;

        if (!empty($_SERVER['REQUEST_METHOD'])) {
            $new = $new->withMethod($_SERVER['REQUEST_METHOD']);
        }
        if (!empty($_SERVER['SERVER_PROTOCOL'])) {
            $new = $new->withProtocolVersion(substr($_SERVER['SERVER_PROTOCOL'], 5));
        }
        $uri = URI::fromGlobals();
        $new = $new->withUri($uri);
        $headers = apache_request_headers();
        if ($headers !== false) {
            foreach ($headers as $header => $hnew) {
                $new = $new->withAddedHeader($header, $hnew);
            }
        }

        return $new;
    }

    /**
     * @internal
     * @todo Move this to a PSR17 factory
     */
    public static function fromGlobals() {
        $clientrequest = parent::fromGlobals();
        $server = (new ServerRequest())->withClientRequest($clientrequest)
            ->withServerParams($_SERVER)
            ->withCookieParams($_COOKIE)
            ->withQueryParams($_GET);
        return $server;
    }
}
