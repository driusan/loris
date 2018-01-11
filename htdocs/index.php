<?php
require_once __DIR__ . '/../vendor/autoload.php';

// FIXME: The code in NDB_Client should mostly be replaced by middleware.
$client = new \NDB_Client;
$client->initialize();

$request = \Zend\Diactoros\ServerRequestFactory::fromGlobals();
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
