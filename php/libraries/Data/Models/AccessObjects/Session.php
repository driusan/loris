<?php 
/**
 * LORIS data access object (DAO) template
 *
 * This class contains all database handling that is needed to
 * permanently store and retrieve Session object instances.
 */
namespace LORIS\Data\Models\AccessObjects;

use \LORIS\Data\Models\TransferObjects as DTO;

class Session implements \LORIS\Data\Models\AccessObject
{
    /**
     * The logged in User object
     */
    private $_user;

    /**
     * A reference to the database connection object
     */
    private $_database;

    /*
     * The query string used to retrieve data from the database
     */
    private $_query;

    /**
     * Constructor
     */
    public function __construct()
    {
        $login = \SinglePointLogin::getInstance();

        $this->_user     = $login->getLoggedInUser();
        $this->_database = \NDB_Factory::singleton()->database();

        // Please fill _query with relevent query string
        $this->_query    = '
            SELECT
                ID,
                CandID,
                CenterID,
                VisitNo,
                Visit_label,
                SubprojectID,
                Submitted,
                Current_stage,
                Date_stage_change,
                Screening,
                Date_screening,
                Visit,
                Date_visit,
                Approval,
                Date_approval,
                Active,
                Date_active,
                RegisteredBy,
                UserID,
                Date_registered,
                Testdate,
                Hardcopy_request,
                BVLQCStatus,
                BVLQCType,
                BVLQCExclusion,
                QCd,
                Scan_done,
                MRIQCStatus,
                MRIQCPending,
                MRIQCFirstChangeTime,
                MRIQCLastChangeTime,
                MRICaveat
            FROM session WHERE 1=1
        ';
    }

    /**
     * Instanciate and return a TransferObject matching the given primary key.
     *
     * @return DTO The requested object
     */
    public function getOne(array $primary_key): \LORIS\Data\Models\TransferObject
    {
        $sql_query =  $this->_query;
        $sql_query .= ' AND ID = :ID ';
        $params = $primary_key;

        $values = $this->_database->pselectRow($sql_query, $params);

        if (empty($values)) {
            throw new \LorisException("This Session does not exists.");
        }

        return new DTO\Session($values);
    }

    /**
     * Instanciate and return all available objects.
     *
     * @return array<DTO> An array of transfer object
     */
    public function getAll()
    {
        $sql_query =  $this->_query;
        $params = array();

        $values = $this->_database->pselect($sql_query, $params);

        if (empty($values)) {
            throw new \LorisException("This Session does not exists.");
        }

        return array_map(function($row) {
            return new DTO\Session($row);
        }, $values);
    }

    /**
     * Update the database with new values 
     *
     * @param DTO $modifiedObject the modified object.
     *
     * @return void
     */
    public function save(\LORIS\Data\Models\TransferObject $modifiedObject)
    {
        $new_values = $modifiedObject->asArray();
        $this->_database->update('session', $new_values, $modifiedObject->getPrimaryKey());
    }

    /**
     * Generate an array of Sessions associated with a given CandID
     *
     * @param $candidate_id string The CandId
     *
     * @return array A list of visits for that candidate_id
     */
    public function getAllByCandidate($candidate_id = '')
    {
        $sql_query =  $this->_query . ' AND CandID = :v_candidate_id ';
        $params = array(
            'v_candidate_id' => $candidate_id,
        );

        $values = $this->_database->pselect($sql_query, $params);

        return array_map(function($row) {
            return new DTO\Session($row);
        }, $values); 
    }
} 
