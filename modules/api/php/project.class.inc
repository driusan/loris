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
class Project extends APIEndpoint
{
    protected $project;

    public function __construct(string $projectName) {
        try {
            $this->project = \NDB_Factory::singleton()->project($projectName);
        } catch(\LorisException $e) {
            var_dump($e);
            $this->project = null;
        }
    }
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

        if ($this->project === null) {
            return (new \LORIS\Http\Response())
                ->withBody(new \LORIS\Http\StringStream(
                    json_encode(['error' => 'No such project'])
                ))->withStatus(404)
                ->withHeader("Content-Type", "application/json");
        }

        if (preg_match("#/?projects/(.+)/?$#", $urlpath, $parsed) === 1) {
            return (new \LORIS\Http\Response())
                ->withBody(new \LORIS\Http\StringStream(
                    json_encode($this->getProjectMetadata()
                ))
            )
                ->withStatus(200)
                ->withHeader("Content-Type", "application/json");
        }
        return (new \LORIS\Http\Response())
            ->withBody(new \LORIS\Http\StringStream(
                json_encode(['error' => 'No such project'])
            )
            )->withStatus(404);
    }

    protected function getProjectMetadata() : array {
        return [
            'Meta' => [
                'Project' => $this->project->getName()
            ],
            'Candidates' => $this->project->getCandidateIds(),
            'Instruments' => array_keys(\Utility::getAllInstruments()),
            'Visits' => array_keys(
                \Utility::getExistingVisitLabels($this->project->getId())
            )
        ];
    }

    public function getETag(ServerRequestInterface $request) : string {
        if ($this->project === null) {
            return "";
        }
        return md5(json_encode($this->getProjectMetadata()));
    }
}
