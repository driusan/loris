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

class SharedQueries extends \LORIS\Data\Provisioners\DBRowProvisioner
{
    /**
     * Create a StarredQueries provisioner, which gets rows for
     * the starred user queries for a given user.
     */
    function __construct(protected \LORIS\LorisInstance $loris, \User $user) {
        parent::__construct(
            "SELECT dq.QueryID, Query, GROUP_CONCAT(u.UserID) as SharedBy, name.Name
            FROM dataquery_queries dq
                LEFT JOIN dataquery_shared_queries_rel dsq ON
                    (dq.QueryID=dsq.QueryID)
                LEFT JOIN users u ON (dsq.SharedBy=u.ID)
                LEFT JOIN dataquery_query_names name ON 
                    (dsq.QueryID=name.QueryID AND name.UserID=dsq.SharedBy)
            WHERE dsq.SharedBy != :userid
            GROUP BY QueryID
            ORDER BY QueryID",
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


        return new Query(
            loris: $this->loris,
            queryID: $row['QueryID'] !== null
                ? intval($row['QueryID'])
                : null,
            query: json_decode($row['Query'], true),
            name: $row['Name'] ?? '',
            sharedBy: explode(',', $row['SharedBy']),
        );
    }
}
