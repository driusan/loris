<?php declare(strict_types=1);
/**
 * This file implements a data provisioner to get starred queries for a user.
 *
 * PHP Version 7
 *
 * @author Dave MacFarlane <david.macfarlane2@mcgill.ca>
 */

namespace LORIS\dqt\Provisioners;
use \LORIS\dqt\Query;
use \LORIS\dqt\QueryRun;

class RecentQueries extends \LORIS\Data\Provisioners\DBRowProvisioner
{
    /**
     * Create a StarredQueries provisioner, which gets rows for
     * the starred user queries for a given user.
     */
    function __construct(protected \LORIS\LorisInstance $loris, \User $user) {
        parent::__construct(
            "SELECT dq.QueryID, RunTime, Query,
               IF(dpq.QueryID IS NULL, 'Unstarred', 'Starred') as Starred,
               IF(dsq.QueryID IS NULL, 'Unshared', 'Shared') as Shared,
               name.Name
            FROM dataquery_queries dq
                JOIN dataquery_run_queries drq ON (dq.QueryID=drq.QueryID)
                LEFT JOIN dataquery_pinned_queries_rel dpq ON
                    (dq.QueryID=dpq.QueryID AND dpq.PinnedBy=:userid)
                LEFT JOIN dataquery_shared_queries_rel dsq ON
                    (dq.QueryID=dsq.QueryID AND dsq.SharedBy=:userid)
                LEFT JOIN dataquery_query_names name ON 
                    (dq.QueryID=name.QueryID AND name.UserID=:userid)
            WHERE drq.UserID=:userid
            ORDER BY drq.RunTime DESC",
            ['userid' => $user->getId()]
        );
    }

    /**
     * {@inheritDoc}
     *
     * @param array $row The database row from the LORIS Database class.
     *
     * @return \LORIS\Data\DataInstance An instance representing this row.
     */
    public function getInstance($row) : \LORIS\Data\DataInstance {
        $qr = new QueryRun(
            loris: $this->loris,
            query: new Query(
                loris: $this->loris,
                queryID: intval($row['QueryID']),
                query: json_decode($row['Query'], true),
                name: $row['Name'] ?? '',
                starred: $row['Starred'] === 'Starred',
                shared: $row['Shared'] === 'Shared',
            ),
            runTime: $row['RunTime'],
        );
        return $qr;
    }
}
