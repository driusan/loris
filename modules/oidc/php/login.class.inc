<?php
namespace LORIS\oidc;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
/**
 * This page initiates the login workflow with openid connect.
 * It populates the state and nonce and then forwards the user
 * to the authorization endpoint of the provider. 
 *
 * @link https://www.github.com/aces/Loris/
 */
class Login extends \NDB_Page
{
    /**
     * Initiate a request to an existing OpenID Connect Identity Provider.
     */
    public function handle(ServerRequestInterface $request) : ResponseInterface {
        $params = $request->getQueryParams();
        if (!isset($params['loginWith'])) {
            return (new \LORIS\Http\Response())
                ->withStatus(400)
                ->withBody(new \LORIS\Http\StringStream("Missing loginWith parameter"));
        }
        $DB = $this->loris->getDatabaseConnection();
        $providerconfig = $DB->pselectRow(
            "SELECT OpenIDProviderID, BaseURI, ClientID, RedirectURI FROM openid_connect_providers WHERE Name=:loginwith",
            ['loginwith' => $params['loginWith']],
        );
        if (empty($providerconfig)) {
            return (new \LORIS\Http\Response())
                ->withStatus(400)
                ->withBody(new \LORIS\Http\StringStream("Invalid loginWith parameter"));

        }

        $thestate = bin2hex(random_bytes(128 / 8));
        $nonce = bin2hex(random_bytes(128 / 8));
        $DB->insert("openid_connect_csrf",
            [
                'OpenIDProviderID' => $providerconfig['OpenIDProviderID'],
                'State' => $thestate,
                'Nonce' => $nonce,
            ]
        );

        $client = new \GuzzleHttp\Client(['base_uri' => $providerconfig['BaseURI']]);
        $endpoints = $this->getOpenIDConfiguration($client);
        if ($endpoints == null) {
            return (new \LORIS\Http\Response())
                ->withStatus(500)
                ->withBody(new \LORIS\Http\StringStream("Could not determine authorization endpoint"));
        }

        return (new \LORIS\Http\Response())
            ->withStatus(302)
            ->withHeader(
                'Location',
                $endpoints['authorization_endpoint']
                    . "?client_id=" . $providerconfig['ClientID']
                    . "&redirect_uri=" . $providerconfig['RedirectURI']
                    . "&response_type=code"
                    . "&scope=openid%20profile%20email%20email_verified"
                    . "&state=" . $thestate
                    . "&nonce=" . $nonce
            );
    }

    /**
     * Get the .well-known/openid-configuration endpoint and parse the
     * results into an array.
     *
     * Client should already have the URL base set.
     */
    private function getOpenIDConfiguration(\GuzzleHttp\Client $client) : ?array {
        $response = $client->request('GET', '/.well-known/openid-configuration');
        if ($response->getStatusCode() !== 200) {
            return null;
        }

        $respjson = json_decode($response->getBody(), true);
        if ($respjson === false) {
            return null;
        }
        return $respjson;
    }

}