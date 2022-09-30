<?php
namespace LORIS\dqt;

use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

class Search extends \NDB_Page
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
        switch ($request->getMethod()) {
        case 'POST':
            $requestjson = (string) $request->getBody();
            $requestdata = json_decode($requestjson, true);
            if ($requestdata === false) {
                return new \LORIS\Http\Response\JSON\BadRequest('Invalid JSON data');
            }
            $user = $request->getAttribute('user');
            // FIXME: Validate query before storing it. Must contain fields.
            $queryID = $this->storeQueryRun($user, $requestjson);
            $query = new Query($queryID);

            $results = $query->getQueryDataProvisioner();

            $table = (new \LORIS\Data\Table())
                ->withDataFrom($query->getQueryDataProvisioner());

            return new \LORIS\Http\Response\JSON\NotImplemented('Demo for UI purposes only, no search performed.');
        }
        return new \LORIS\Http\Response\JSON\BadMethod('Must POST search criteria');
    }

    private function storeQueryRun(\User $user, string $requestjson) {
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

        $DB->unsafeInsert(
                'dataquery_run_queries',
                [
                    'QueryID'  => $queryID, 
                    'UserID'  => $user->getId(),
                ],
        );
        return $queryID;
    }
}
