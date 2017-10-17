<?php
namespace LORIS\Http;
use \Psr\Http\Message\MessageInterface;
use \Psr\Http\Message\StreamInterface;

/**
 * An HttpMessage represents the basic functionality shared between
 * HTTP requests and response. Ie. It represents a set of headers with
 * an optional body sent over HTTP.
 */
class HttpMessage implements \Psr\Http\Message\MessageInterface {
    protected $protocol;
    public function getProtocolVersion() {
        return $this->protocol;
    }

    public function withProtocolVersion($version) {
        $new = clone $this;
        $new->protocol = $version;
        return $new;
    }

    // FIXME: The PSR spec has the same braindead requirement as Apple filesystems,
    // wherein it demands case preservation but case insensitivity. This is case
    // sensitive.
    protected $headers = [];
    public function getHeaders() {
        return $this->headers;
    }

    public function hasHeader($name) {
        return isset($this->headers[$name]);
    }

    public function getHeader($name) {
        return $this->headers[$name] ?? [];
    }

    public function getHeaderLine($name) {
        if (!isset($this->headers[$name])) {
            return "";
        }
        return join(", ", $this->headers[$name]);
    }

    public function withHeader($name, $value) {
        $new = clone $this;
        if (is_array($value)) {
            $new->headers[$name] = $value;
        } else {
            $new->headers[$name] = [$value];
        }
        return $new;
    }

    // Warning: Mutates the existing instance. Should only be called from constructors.
    protected function setHeader($name, $value) {
        if (is_array($value)) {
            $this->headers[$name] = $value;
        } else {
            $this->headers[$name] = [$value];
        }
    }

    public function withAddedHeader($name, $value) {
        $new = clone $this;
        if (!is_array($value)) {
            $new->headers[$name][] = $value;
        } else {
            foreach ($value as $newval) {
                $new->headers[$name][] = $newval;
            }
        }
        return $new;
    }

    public function withoutHeader($name) {
        $new = clone $this;
        unset($this->headers[$name]);
        return $new;
    }

    protected $body;

    public function getBody() {
        return $this->body;
    }

    public function withBody(StreamInterface $body) {
        $new = clone $this;
        $new->body = $body;
        return $new;
    }

    public static function fromRequest() : MessageInterface {
        return (new HttpMessage())->withProtocolVersion("1.1");
    } 

    public function __toString() {
        $val = "";
        foreach ($this->headers as $header => $vals) {
            $val .= "$header: " . $this->getHeaderLine($header) . "\n";
        }
        $body = $this->getBody();
        if ($body !== null && $body->getSize() > 0) {
            $val .= "\n$body";
        }
        return $val;
    }
}
