<?php
namespace LORIS\dqt;

use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use \LORIS\Data\Filters\AccessibleResourceFilter;

/**
 * Queries page
 *
 * PHP version 7
 *
 * @author   Dave MacFarlane <dave.macfarlane@mcin.ca>
 */

class Queries extends \NDB_Page
{
    public $skipTemplate = true;
    /**
     * Allow all users for testing
     *
     * @param \User $user The user whose access is being checked
     *
     * @return bool
     */
    function _hasAccess(\User $user) : bool
    {
        return true;
    }

    public function handle(ServerRequestInterface $request) : ResponseInterface {
        $user = $request->getAttribute('user');
        $url    = $request->getURI()->getPath();
        $pieces = [];
        $queryID = null;
        if (preg_match(
                    "/queries$/",
                    $url,
                    $pieces
                    ) === 1
           ) {
            switch ($request->getMethod()) {
            case 'GET':
                return new \LORIS\Http\Response\JSON\OK([
                        'recent' => iterator_to_array($this->getRecentQueries($user)),
                        'shared' => iterator_to_array($this->getSharedQueries($user)),
                        'topqueries' => iterator_to_array($this->getTopQueries($user)),
                ]);
            case 'POST':
                $requestjson = (string) $request->getBody();
                $requestdata = json_decode($requestjson, true);
                if ($requestdata === false) {
                    return new \LORIS\Http\Response\JSON\BadRequest('Invalid JSON data');
                }
                $user = $request->getAttribute('user');
                // FIXME: Validate query before storing it. Must contain fields.
                $queryID = $this->storeQuery($user, $requestjson);
                return new \LORIS\Http\Response\JSON\OK([
                        'QueryID' => $queryID
                ]);
            default:
            }
        }
        if (preg_match(
                    "/queries\/([0-9]+)$/",
                    $url,
                    $pieces
                    ) === 1
           ) {
            $queryID = intval($pieces[1]);
            return $this->handleQueryRequest($request, $queryID);
        }
        if (preg_match(
                    "/queries\/([0-9]+)\/run$/",
                    $url,
                    $pieces
                    ) === 1
           ) {
            $queryID = intval($pieces[1]);
            return $this->runQuery($user, $queryID);
        }
        if (preg_match(
                    "/queries\/([0-9]+)\/count$/",
                    $url,
                    $pieces
                    ) === 1
           ) {
            $queryID = intval($pieces[1]);
            return $this->countResults($user, $queryID);
        }
        if (preg_match(
                    "/queries\/([0-9]+)\/run\/([0-9]+)$/",
                    $url,
                    $pieces
                    ) === 1
           ) {
            $queryID = intval($pieces[1]);
            $runID = intval($pieces[2]);
            return $this->queryRun($user, $queryID, $runID);
        }
        return new \LORIS\Http\Response\JSON\NotFound();
    }

    public function getRecentQueries(\User $user) : iterable {
        return (new provisioners\RecentQueries($this->loris, $user))
            ->filter(new AccessibleResourceFilter())
            ->execute($user);
    }

    public function getSharedQueries(\User $user) : iterable {
        return (new provisioners\SharedQueries($this->loris, $user))
            ->filter(new AccessibleResourceFilter())
            ->execute($user);
    }

    public function getTopQueries(\User $user) : iterable {
        return (new provisioners\StudyQueries($this->loris, 'topquery'))
            ->filter(new AccessibleResourceFilter())
            ->execute($user);
    }

    private function storeQuery(\User $user, string $requestjson) {
        $DB = $this->loris->getDatabaseConnection();
        $queryID = $DB->pselectOne(
            "SELECT QueryID
                FROM dataquery_queries
             WHERE Query=:json",
            [
                'json' => $requestjson,
            ],
        );
        if ($queryID === null) {
            // Dealing with JSON need to use the unsafe wrapper
            $DB->unsafeInsert(
                'dataquery_queries',
                [
                    'Query'  => $requestjson,
                ],
            );
            $queryID = $DB->getLastInsertId();
        }
        return intval($queryID);
    }

    public function handleQueryRequest($request, int $queryID) : ResponseInterface {
        $user = $request->getAttribute('user');

        $query = null;
        try {
            $query = new Query($this->loris, $queryID);
        } catch (\NotFound $e) {
            return new \LORIS\Http\Response\JSON\NotFound();
        }
        if (!$query->isAccessibleBy($user)) {
            return new \LORIS\Http\Response\JSON\Forbidden();
        }
        switch($request->getMethod()) {
            case 'GET':
                return new \LORIS\Http\Response\JSON\OK($query->toArray());
            case 'PATCH':
                $params = $request->getQueryParams();
                // Can only do 1 action at a time.
                if (isset($params['pin']) && isset($params['share'])) {
                    return new \LORIS\Http\Response\JSON\BadRequest();
                }

                if ($params['pin'] == 'unpin') {
                    $query->unpin($user);
                    return new \LORIS\Http\Response\JSON\OK(['msg'=>'Unpinned query']);
                } else if ($params['pin'] == 'pin') {
                    $query->pin($user);
                    return new \LORIS\Http\Response\JSON\OK(['msg'=>'Pinned query']);
                }

                if ($params['share'] == 'share') {
                    $query->share($user);
                    return new \LORIS\Http\Response\JSON\OK(['msg'=>'Shared query']);
                } else if ($params['share'] == 'unshare'){
                    $query->unshare($user);
                    return new \LORIS\Http\Response\JSON\OK(['msg'=>'Unshared query']);
                }

                if (!empty($params['type'])) {
                        if (str_contains($params['type'], 'untop')) {
                            $query->removeAdminPinnedQuery('topquery');
                        } else if (str_contains($params['type'], 'top')) {
                            $query->setAdminPinnedQuery($user, $params['name'], 'topquery');
                        }

                        if (str_contains($params['type'], 'dashboard')) {
                            $query->setAdminPinnedQuery($user, $params['name'], 'dashboard');
                        }
                        return new \LORIS\Http\Response\JSON\OK(['msg' => 'Pinned query']);
                } else if (!empty($params['name'])) {
                    $query->setQueryName($user, $params['name']);
                    return new \LORIS\Http\Response\JSON\OK(['msg'=>'named query']);
                }

                return new \LORIS\Http\Response\JSON\BadRequest('Unhandled PATCH action');
        }
        return new \LORIS\Http\Response\JSON\BadMethod('Request must be GET');
    }

    public function runQuery(\User $user, int $queryID) : ResponseInterface {
        try {
            $query = new Query($this->loris, $queryID);

            $queryRun = $query->newRun($user);
            $queryRun->insertCandidates($user);
            $data = $queryRun->getQueryDataProvisioner();

            $table = (new \LORIS\Data\Table())
                ->withDataFrom($data);
            $rows  = $table->getRows($user);
            $stream = new \LORIS\Http\DataIteratorBinaryStream($rows);
            return (new \LORIS\Http\Response())
                ->withHeader("Content-Type", "text/plain")
                //->withHeader("Content-Type", "application/octet-stream")
                ->withBody($stream);
        } catch (\LorisException $e) {
            return new \LORIS\Http\Response\JSON\NotImplemented($e->getMessage());

        }
    }

    public function countResults(\User $user, int $queryID) : ResponseInterface {
        try {
            $query = new Query($this->loris, $queryID);

            $candidates = $query->matchCandidates($user);
            return new \LORIS\Http\Response\JSON\OK([
                'count' => count($candidates),
            ]);
        } catch (\LorisException $e) {
            return new \LORIS\Http\Response\JSON\NotImplemented($e->getMessage());
        }
    }
}
