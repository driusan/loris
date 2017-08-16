<?php
/**
 * The LORIS\Data namespace contains interfaces and classes used to extract and filter
 * data. It implements the framework for permission based filtering.
 */
namespace LORIS\Data;

/**
 * A DataFilter represents a ruleset for whether or not data should be filtered out
 * of a DataProvisioner. It generally is used for things like verifying permissions
 * in a provisioner.
 */
interface Filter {
    /**
     * Filter returns true iff the resource should be filtered out of the results
     * displayed to user.
     */
	function Filter(\Loris\User $user, Instance $resource) : bool;
}

/**
 * A ResourceInstance represents a single record returned from a DataProvisioner.
 * Resources must be serializable to JSON, but the JSON content is flexible.
 */
interface Instance {
    /**
     * ToJSON must serialize this resource instance to a string of valid JSON.
     */
    function ToJSON() : string;
};

/**
 * A DataProvisioner is something which retrieves data from a source (usually
 * the database) and filters it. It represents arbitrarily structured data such
 * as a row in a table. Implementations know the details of the data, but a 
 * DataProvisioner itself only deals with ResourceInstances and filters.
 *
 * It In order to use this class, it must be extended and implement the
 * GetAllRows() function.
 */
abstract class Provisioner {
    /**
     * Filters to apply to this data before returning it to the user. 
     *
     * Filters generally do things like site based or project based permissions to
     * the data.
     *
     * @var DataFilter[]
     */
	protected $filters = [];


    /**
     * DataProvisioners are an immutable data structure with a fluent interface.
     *
     * They must have a new foo() constructor.
     */ 
	public function __construct() {
	}

    /**
     * Filter returns a new DataProvisioner which is identical to this one, except
     * also has the argument added as a data filter.
     */
    public function Filter(Filter $filter) : Provisioner {
        $d = clone $this;
        $d->filters[] = $filter;
        return $d;
    }

    /**
     * GetAllRows must be implemented in order to create a DataProvisioner.
     *
     * It gets all rows possible for this data type, regardless of permissions
     * or other details, which then get filtered before being returned to the
     * user.
     *
     * @return Instance[] array of all resources provided by this data source.
     */
	abstract protected function GetAllRows() : array;

    /**
     * Execute gets the rows for this data source, and applies all
     * existing filters.
     *
     * @return Instance[]
     */
	public function Execute(\Loris\User $user) : array {
        return array_filter($this->getAllRows(), function($val) {
            // Check each filter. If any one fails, we don't include the data.
			foreach ($this->filters as $filter) {
				if (!$filter->Filter($user, $r)) {
                    return false;
                }
            }
            // All filters passed.
            return true;
        });
	}
};


/**
 * A Table Represents a table displayed on the frontend to a user.
 */
class Table {
    /**
     * @var \LORIS\Data\Provisioner
     */
    protected $dataProvider;

    public function __construct() {
    }

    /**
     * Returns a new Table which is identical to this one, except gets its
     * data from the DataProvisioner provided.
     */
    public function WithDataFrom(\LORIS\Data\Provisioner $provisioner) : Table {
        $t = clone $this;
        $t->dataProvider = $provisioner;
        return $t;
    }

    /**
     * Get rows returns all rows that the data provider provides, filtering them
     * for $user.
     *
     * @return \LORIS\Data\Instance[] of all the filtered data.
     */
    public function getRows(\LORIS\User $user) : array {
       return $this->dataProvider->execute($user); 
    }

    /**
     * Serializes this table to JSON for $user.
     */
    public function toJSON(\LORIS\User $user) : string {
        $allRows = $this->getRows($user);
        return $allRows;
    }

    /**
     * Filter returns a new table with DataFilter added as a filter.
     */
    public function Filter(\LORIS\Data\Filter $filter) : Table {
        $t = clone $this;
        $t->dataProvider = $this->dataProvider->Filter($filter);
        return $t;
        /* FIXME: Add another method which takes a callback function instead to
         * simplify usage./
        $t->Filter(new class() implements DataFilter {
            public function Filter(DataResource $resource) : bool {
                return $callable($resource);
            }
        });
         */
    }
}

/*
 * Everything below this line is an attempt at implementing/using the above.
 */
namespace \SomeModule;
class SiteMatchFilter implements \LORIS\Data\Filter {
    public function Filter(\Loris\User $user, \Loris\Data\Instance $resource) : bool {
        if (method_exists($resource, 'getCenterIDs')) {
            // If the Resource belongs to multiple CenterIDs, the user can access the data if the
            // user is part of any of thos centers.
            $resourceSites = $resource->getCenterIDs();
            foreach ($resourceSites as $site) {
                if ($user->hasCenter($resourceSite)) {
                       return true;
                }
            }
            return false;
        } else if (!method_exists($resource, 'getCenterID')) {
            $resourceSite = $resource->getCenterID();
            return $user->hasCenter($resourceSite);
        }
        throw new \LorisException("Can not implement SiteMatchFilter on a resource type that doesn't have sites.");
    }
}

class CandidateList extends NDB_Page {
    private $table; // TableD
    public function __construct() {
        // Provisioner should filter by CenterID
        $provisioner = (new CandidateListRowProvisioner())
            ->Filter(new SiteMatchFilter);

        $this->table = (new Table())
            ->WithDataFrom($provisioner);
    }

    public function toJSON() {
        return $this->table->toJSON(User::singleton());
    }
}

class CandidateListRow implements \LORIS\Data\Instance {
    protected $candidate;
    protected $participantstatus;
    protected $visitCount;
    protected $feedback;

    public function ToJSON() string {
        // Site, DCCID, PSCID, GEnder, EntityType, ParticipantStatus,
        // Subproject, DoB, ScanDone, VisitCount, LatestVisitStatus,
        // Feedback
        $arr = [
            'Site' => $this->candidate->getSiteName(),
            'CandID' => $this->candidate->getCandID(),
            'PSCID' => $this->candidate->getCandID(),
            'Gender' => $this->candidate->getGender(),
            'EntityType' => $this->candidate->getEntityType(),
            'Participant Status' => $this->participantStatus,
            'Subproject' => $this->candidate->getSubproject(),
            'DoB' => $this->candidate->getDateOfBirth(),
            'Scan Done' => $this->candidate->getScanDone(),
        ];
        return json_encode($arr);
    }
}

class CandidateListRowProvisioner extends \LORIS\Data\Provider {
    protected function GetAllRows() : array {
        $sql = "SELECT c.CandID,
                 COALESCE(pso.Description,'Active') as ParticipantStatus,
                 COUNT(DISTINCT s.Visit_label) as VisitCount,
                 IFNULL(MIN(feedback_bvl_thread.Status+0),0) as Feedback,
        FROM candidate c
              LEFT JOIN psc ON (c.CenterID=psc.CenterID)
              LEFT JOIN session s ON (c.CandID = s.CandID AND s.Active = 'Y')
              LEFT JOIN feedback_bvl_thread
                  ON (c.CandID=feedback_bvl_thread.CandID)
              LEFT JOIN participant_status ps ON (ps.CandID=c.CandID)
              LEFT JOIN participant_status_options pso
                  ON (ps.participant_status=pso.ID)
             WHERE c.Active = 'Y'";

        $db = Database::singleton();
        $query = $db->pselect($sql, array());
        $results = [];
        foreach ($query as $row) {
            $r = new CandidadateListRowInstance(
                Candidate::singleton($row['CandID'],
                $row['Participant_Status']
                $row['VisitCount'], 
                $row['Feedback'], 
            );
            $results[] = $r;
        }
       return $results; 
    }
}
