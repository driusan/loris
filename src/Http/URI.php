<?php
namespace LORIS\Http;
use \Psr\Http\Message\UriInterface;

/**
 * A URI class represents a URI in some capacity.
 */
class URI implements UriInterface {
    protected $scheme = "";
    public function getScheme() : string {
        return $this->scheme;
    }

    public function withScheme($scheme) {
        $new = clone $this;
        $new->scheme = $scheme;
        return $new;
    }

    public function getAuthority() : string {
        $val = "";
        $ui = $this->getUserInfo();
        if (!empty($ui)) {
            $val .= "$ui@";
        }

        $host = $this->getHost();
        if (!empty($host)) {
            $val .= $host;
        }

        $port = $this->getPort();
        if (!empty($port) && $this->getSchemeDefaultPort($this->getScheme()) != $port) {
            $val .= ":$port";
        }
        return $val;
    }

    protected function getSchemeDefaultPort(string $scheme) {
        switch(strtolower($scheme)) {
        case 'http': return 80;
        case 'https': return 443;
        }
    }

    protected $username;
    protected $password;

    public function getUserInfo() : string {
        $val = "";
        if (!empty($this->username)) {
            $val = $this->username;
        }
        if (!empty($this->password)) {
            $val .= ":" . $this->password;
        }
        return $val;
    }

    public function withUserInfo($user, $password=NULL) {
        $new = clone $this;
        $new->username = $user;
        $new->password = $password;
        return $new;
    }


    protected $host = "";

    public function getHost() : string {
        return $this->host;
    }

    public function withHost($host) {
        $new = clone $this;
        $new->host = $host;
        return $new;
    }

    protected $port;
    public function getPort() {
        return $this->port;
    }

    public function withPort($val) {
        $new = clone $this;
        $new->port = $val;
        return $new;
    }


    protected $path = "";
    public function getPath() : string {
        return $this->path;
    }
    public function withPath($path) {
        $new = clone $this;
        $new->path = $path;
        return $new;
    }

    protected $query = "";
    public function getQuery() : string {
        return $this->query;
    }

    protected $fragment = "";
    public function getFragment() {
        return $this->fragment;
    }

    public function withFragment($fragment) {
        $new = clone $this;
        $new->fragment = $fragment;
        return $new;
    }

    public function withQuery($q) {
        $new = clone $this;
        $new->query = $q;
        return $new;
    }


    public function __toString() : string {
        $val = "";
        if (!empty($this->scheme)) {
            $val .= $this->scheme . ":";
        }
        $authority = $this->getAuthority();
        $path = $this->getPath();
        // Rules according to PSR7 in comments:
        if (!empty($authority)) {
            // - If an authority is present, it MUST be prefixed by "//".
            $val .= "//" . $authority;
            if (!empty($path)) {
                 //- If the path is rootless and an authority is present, the path MUST
                 // be prefixed by "/".
                if ($path[0] != "/") {
                    $val .= "/$path";
                } else {
                    $val .= $path;
                }
            }
        } else {
            if (!empty($path)) {
                // - If the path is starting with more than one "/" and no authority is
                //  present, the starting slashes MUST be reduced to one.
                $newpath = preg_replace("(^[/]+)", "/", $path);
                $val .= $newpath;
            }
        }
        $query = $this->getQuery();
        if(!empty($query)) {
            $val .= "?$query";
        }
        $fragment = $this->getFragment();
        if(!empty($fragment)) {
            $val .= "#$fragment";
        }

        return $val;
    }

    static public function fromGlobals() {
        $val = new URI();
        if (!empty($_SERVER['REQUEST_SCHEME'])) {
            $val = $val->withScheme($_SERVER['REQUEST_SCHEME']);
        } else {
            if (!empty($_SERVER['HTTPS'])) {
                $val = $val->withScheme("https");
            } else {
                $val = $val->withScheme("http");
            }
        }
        if (!empty($_SERVER['HTTP_HOST'])) {
            $val = $val->withHost($_SERVER['HTTP_HOST']);
        }

        if (!empty($_SERVER['PHP_AUTH_USER']) || !empty($_SERVER['PHP_AUTH_PW'])) {
            $val = $val->withUserInfo($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']);
        }

        if (!empty($_SERVER['SERVER_PORT'])) {
            $val = $val->withPort($_SERVER['SERVER_PORT']);
        }
        if (!empty($_SERVER['PHP_SELF'])) {
            $val = $val->withPath($_SERVER['PHP_SELF']);
        }
        if (!empty($_SERVER['QUERY_STRING'])) {
            $val = $val->withQuery($_SERVER['QUERY_STRING']);
        }
        // Fragment doesn't get sent with the HTTP request, it's client side only.
        return $val;
    }
}
