<?php
/**
 * This implements the projects API endpoint.
 *
 * PHP Version 7
 *
 * @category API
 * @package  Loris
 * @author   Dave MacFarlane <dave.macfarlane@mcin.ca>
 * @license  Loris license
 * @link     https://github.com/aces/Loris
 */
namespace LORIS\api;

use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;


/**
 * A class for handling the api/v????/projects/* endpoint.
 *
 * @category API
 * @package  Loris
 * @author   Dave MacFarlane <dave.macfarlane@mcin.ca>
 * @license  Loris license
 * @link     https://github.com/aces/Loris
 */
class Projects extends APIEndpoint
{
    /**
     * All logged in users may see what projects exist
     *
     * @return boolean true if access is permitted
     */
    function _hasAccess()
    {
        $user = \User::singleton();
        return !($user instanceof \AnonymousUser);
    }

    /**
     * Return which methods are supported by this endpoint.
     *
     * Login can only be POSTed to
     *
     * @return array supported HTTP methods
     */
    protected function allowedMethods() : array
    {
        return ['GET'];
    }

    /**
     * Versions of the LORIS API which are supported by this
     * endpoint.
     *
     * Login has existed since v0.0.1 of the API and has not
     * changed
     *
     * @return array a list of supported API versions.
     */
    protected function supportedVersions() : array
    {
        return [
                "v0.0.1",
                "v0.0.2",
                "v0.0.3-dev",
               ];
    }

    /**
     * Handles a login request
     *
     * @param ServerRequestInterface $request The incoming PSR7 request
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        $urlpath = $request->getURI()->getPath();
        if ($urlpath == "/projects" || $urlpath=="projects") {
            return (new \LORIS\Http\Response())
                ->withBody(new \LORIS\Http\StringStream(
                    json_encode($this->getProjectList())
                ))
                ->withHeader("Content-Type", "application/json");
        }
        if (preg_match("#/?projects/(.+)/?$#", $urlpath, $parsed) === 1) {
            $projectname = $parsed[1];
            return (new Project($projectname))->handle($request);
        }
        throw new \LorisException("FIXME: Implement handling projects other than ^/projects$");
    }

    protected function getProjectList() : array {
        $config = \NDB_Factory::singleton()->config();

        $useProjects = $config->getSetting("useProjects");
        $useEDC      = $config->getSetting("useEDC");

        if ($useEDC === '1' || $useEDC === 'true') {
            $useEDC = true;
        } else {
            $useEDC = false;
        }
        $PSCID       = $config->getSetting("PSCID");
        $PSCIDFormat = \Utility::structureToPCRE($PSCID['structure'], "SITE");

        $type = $PSCID['generation'] == 'sequential' ? 'auto' : 'prompt';

        $settings = [
                     "useEDC" => $useEDC,
                     "PSCID"  => [
                                  "Type"  => $type,
                                  "Regex" => $PSCIDFormat,
                                 ],
                    ];

        if ($useProjects && $useProjects !== "false" && $useProjects !== "0") {
            $projects  = \Utility::getProjectList();
            $projArray = [];
            foreach ($projects as $project) {
                $projArray[$project] = $settings;
            }
            return ["Projects" => $projArray];
        } else {
            return ["Projects" => array("loris" => $settings)];
        }

    }

    public function getETag(ServerRequestInterface $request) : string {
        return md5(json_encode($this->getProjectList(), true));
    }
}
