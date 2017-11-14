<?php
namespace Test;
require_once __DIR__ . '/../vendor/autoload.php';

$client = new \NDB_Client;
$client->initialize();

$get = $_GET;
$request = \LORIS\Http\ServerRequest::fromGlobals();

// There are 2 entry-points to this file.
// 1. A mod_rewrite rule that adds a lorispath query param.
// 2. A ErrorDocument 404 handler that falls back to this script
//    if Apache doesn't find anything.
// They have different ways to get the "correct" page path from the URL
// that the user was trying to access.
if (isset($_GET['lorispath'])) {
    // It's being done from mod_rewrite.
    $url = \LORIS\Http\URI::fromGlobals()->withPath($_GET['lorispath']);
    $paths = explode("/", $get['lorispath']);
    unset($get['lorispath']);
} else {
    // It's being used as a 404 handler.
    $url = \LORIS\Http\URI::fromGlobals()->withPath($_SERVER['REDIRECT_URL']);
    $paths = explode("/", $url->getPath());
    //parse_str($_SERVER['REDIRECT_QUERY_STRING'] ?? '', $get);
}

// Lexically resolve path components that have . or .. in them.
// FIXME: This should be in a class where it's useable elsewhere in LORIS.
$newpath = [];
foreach($paths as $val) {
    if ($val == ".") {
        continue;
    } else if ($val == "..") {
        array_pop($newpath);
    } else {
        array_push($newpath, $val);
    }
}
$url = $url->withPath(join("/", $newpath));
// FIXME: This is broken.. it's missing the = part of the query.
$url = $url->withQuery(join("&", $get));
$request = $request->withURI($url)->withQueryParams($get);

// Now that we've created the ServerRequest, handle it.
$loris = new \LORIS\Router\BaseRouter(__DIR__ . "/../project/", __DIR__ . "/../modules/");

// Middleware that happens on every request. This doesn't include
// any authentication middleware, because that's done dynamically
// based on the module router, depending on if the module is public.
$middlewarechain = (new \LORIS\Middleware\ContentLength())->withMiddleware(new \LORIS\Middleware\ETag())->withMiddleware(new \LORIS\Middleware\ResponseGenerator());

// Now handle the request.
$response = $middlewarechain->process($request, $loris);

// Add the HTTP header line.
header("HTTP/" . $response->getProtocolVersion() . " " . $response->getStatusCode() . " " . $response->getReasonPhrase());

// Add the headers from the response.
$headers = $response->getHeaders();
foreach ($headers as $name => $values) {
    header($name . ': ' . implode(', ', $values));
}

// Include the body. FIXME: this should take advantage of the fact
// that it's a stream to chunk up large responses and lower memory
// usage.
print $response->getBody();
