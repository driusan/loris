<?php
namespace LORIS\Http;
use \Psr\Http\Message\StreamInterface;
use \Psr\Http\Message\ResponseInterface;

/**
 * A ServerResponse represents a response sent from a server to a
 * Client's ClientRequest. It encompasses a set of headers and a
 * response code, along with an optional body.
 */
class ServerResponse extends HttpMessage implements ResponseInterface {
    protected $statusCode;
    protected $statusReason;

    public function __construct($statuscode, StreamInterface $body) {
        $this->statusCode = $statuscode;
        $this->body = $body;
        $this->protocol = "1.1";
    }
    public function getStatusCode() {
        return $this->statusCode;
    }

    public function withStatus($code, $reasonPhrase='') {
        $new = clone $this;
        $new->statusCode = $code;
        $new->statusReason = $reasonPhrase;
        return $new;
    }
    public function getReasonPhrase() {
        if ($this->statusReason == '') {
            switch($this->statusCode) {
            case 100: $this->statusReason = 'Continue'; break;
            case 101: $this->statusReason = 'Switching Protocols'; break;

            case 200: $this->statusReason = 'OK'; break;
            case 201: $this->statusReason = 'Created'; break;
            case 202: $this->statusReason = 'Accepted'; break;
            case 203: $this->statusReason = 'Non-Authoritative Information'; break;
            case 204: $this->statusReason = 'No Content'; break;
            case 205: $this->statusReason = 'Reset Content'; break;
            case 206: $this->statusReason = 'Partial Content'; break;

            case 300: $this->statusReason = 'Multiple Choices'; break;
            case 301: $this->statusReason = 'Moved Permanently'; break;
            case 302: $this->statusReason = 'Found'; break;
            case 303: $this->statusReason = 'See Other'; break;
            case 304: $this->statusReason = 'Not Modified'; break;
            case 305: $this->statusReason = 'Use Proxy'; break;
            //case 306: $this->statusReason = ''; break; 306 is not in RFC7231
            case 307: $this->statusReason = 'Temporary Redirect'; break;

            case 400: $this->statusReason = 'Bad Request'; break;
            case 401: $this->statusReason = 'Unauthorized'; break;
            case 402: $this->statusReason = 'Payment Required'; break;
            case 403: $this->statusReason = 'Forbidden'; break;
            case 404: $this->statusReason = 'Not Found'; break;
            case 405: $this->statusReason = 'Method Not Allowed'; break;
            case 406: $this->statusReason = 'Not Acceptable'; break;
            case 407: $this->statusReason = 'Proxy Authentication Required'; break;
            case 408: $this->statusReason = 'Request Timeout'; break;
            case 409: $this->statusReason = 'Conflict'; break;
            case 410: $this->statusReason = 'Gone'; break;
            case 411: $this->statusReason = 'Length Required'; break;
            case 412: $this->statusReason = 'Precondition Failed'; break;
            case 413: $this->statusReason = 'Payload Too Large'; break;
            case 414: $this->statusReason = 'URI Too Long'; break;
            case 415: $this->statusReason = 'Unsupported Media Type'; break;
            case 416: $this->statusReason = 'Range Not Satisfiable'; break;
            case 417: $this->statusReason = 'Expectation Failed'; break;
            case 426: $this->statusReason = 'Upgrade Required'; break;

            case 500: $this->statusReason = 'Internal Server Error'; break;
            case 501: $this->statusReason = 'Not Implemented'; break;
            case 502: $this->statusReason = 'Bad Gateway'; break;
            case 503: $this->statusReason = 'Service Unavailable'; break;
            case 504: $this->statusReason = 'Gateway Timeout'; break;
            case 505: $this->statusReason = 'HTTP Version Not Supported'; break;
            }
        }
        return $this->statusReason;
    }

    function __toString() {
        $val = $this->statusCode . " " . $this->getReasonPhrase() . "\n";
        $val .= parent::__toString() . "\n";
        $val .= $this->getBody()->getContents();
        return $val;
    }
}
