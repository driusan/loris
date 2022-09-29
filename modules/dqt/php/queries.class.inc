<?php
namespace LORIS\dqt;

use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

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
                    "/queries\/([0-9]+)$/",
                    $url,
                    $pieces
                    ) === 1
           ) {
            $queryID = intval($pieces[1]);
        }

        if ($queryID !== null) {
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


                return new \LORIS\Http\Response\JSON\OK($query->toArray());
            }
            return new \LORIS\Http\Response\JSON\BadMethod('Request must be GET');
        }

        switch ($request->getMethod()) {
        case 'GET':
                $queries = $this->getQueries($user);
                return new \LORIS\Http\Response\JSON\OK(['queries' => $queries ]);
        }
        return new \LORIS\Http\Response\JSON\BadMethod('Request must be GET');
    }

    public function getQueries(\User $user) : iterable {
        $DB = $this->loris->getDatabaseConnection();
        $potentialQueries = $DB->pselect("
            SELECT dq.QueryID, RunTime, Query,
               IF(dpq.QueryID IS NULL, 'Unpinned', 'Pinned') as Pinned,
               IF(dsq.QueryID IS NULL, 'Unshared', 'Shared') as Shared
            FROM dataquery_queries dq
                JOIN dataquery_run_queries drq ON (dq.QueryID=drq.QueryID)
                LEFT JOIN dataquery_pinned_queries_rel dpq ON
                    (dq.QueryID=dpq.QueryID AND dpq.PinnedBy=:userid)
                LEFT JOIN dataquery_shared_queries_rel dsq ON
                    (dq.QueryID=dsq.QueryID AND dsq.SharedBy=:userid)
                
            WHERE drq.UserID=:userid
            ORDER BY drq.RunTime DESC",
            ['userid' => $user->getId()]
        );

        $results = [];
        // FIXME: Filter out queries that aren't accessible by the
        // user because of the fields/modules
        // FIXME: Use a DataProvisioner?
        foreach($potentialQueries as $query) {
            // Convert pinned/unpinned to boolean
            if ($query['Pinned'] === 'Pinned') {
                $query['Pinned'] = true;
            } else {
                $query['Pinned'] = false;
            }
            if ($query['Shared'] === 'Shared') {
                $query['Shared'] = true;
            } else {
                $query['Shared'] = false;
            }
            // Convert from string to PHP array so that it's not double
            // escaped when json_encode is called.
            $query['Query'] = json_decode($query['Query'], true);

            $results[] = $query;
            
        }
        return $results;
    }
}
