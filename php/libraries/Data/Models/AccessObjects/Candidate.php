<?php
/**
 * Candidate Data Access Object (DAO).
 *
 * This class contains all database handling that is needed to 
 * permanently store and retrieve Candidate object instances.
 */
namespace LORIS\Data\Models\AccessObjects;

use \LORIS\Data\Models\TransferObjects as DTO;

class Candidate implements \LORIS\Data\Models\AccessObject
{
    private $_user;
    private $_database;
    private $_query;

    /**
     *
     */
    public function __construct()
    {
        $login = \SinglePointLogin::getInstance();

        $this->_user     = $login->getLoggedInUser();
        $this->_database = \NDB_Factory::singleton()->database();
        $this->_query    = '
            SELECT
                candidate.ID,
                candidate.CandID,
                candidate.PSCID,
                candidate.ExternalID,
                candidate.DoB,
                candidate.EDC,
                candidate.Gender,
                candidate.CenterID,
                candidate.ProjectID,
                candidate.Ethnicity,
                candidate.Active,
                candidate.Date_active,
                candidate.RegisteredBy,
                candidate.UserID,
                candidate.Date_registered,
                candidate.flagged_caveatemptor,
                candidate.flagged_reason,
                candidate.flagged_other,
                candidate.flagged_other_status,
                candidate.Testdate,
                candidate.Entity_type,
                candidate.ProbandGender,
                candidate.ProbandDoB,
                caveat_options.Description
            FROM candidate 
            LEFT JOIN caveat_options ON (candidate.flagged_reason = caveat_options.ID)
            WHERE 1=1
        ';
    }

    /**
     * Instanciate and return a TransferObject matching the given primary key.
     *
     * @return DTO The requested object
     */
    public function getOne(array $primary_key): \LORIS\Data\DTO
    {
        $sql_query =  $this->_query;
        $sql_query .= ' AND candidate.CandID = :CandID ';
        $params = $primary_key;

        if (!$this->_user->hasPermission('access_all_profiles')) {
            $sql_query .= ' AND FIND_IN_SET(CenterID, :v_user_centers) ';
            $params['v_user_centers'] = join(',',$this->_user->getCenterIDs());
        }

        $values = $this->_database->pselectRow($sql_query, $params);

        if (empty($values)) {
            throw new \LorisException("This candidate does not exists.");
        }

        $candidate = new DTO\Candidate($values); 
        return $candidate;
    }

    /**
     * Instanciate all available objects as TransferObject 
     *
     * @return array<DTO> An array of transfer object
     */
    public function getAll()
    {
        $sql_query = $this->_query;
        $params = array();

        if (!$this->_user->hasPermission('access_all_profiles')) {
            $sql_query .= ' AND FIND_IN_SET(CenterID, :v_user_centers) ';
            $params['v_user_centers'] = join(',',$this->_user->getCenterIDs());
        }

        $values = $this->_database->pselect($sql_query, $params);

        if (empty($values)) {
            throw new \LorisException("No candidate");
        }

        return array_map(function($row) {
            return new DTO\Candidate($row);
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
        $new_values = $candidate->asArray();
        $this->_database->update('candidate', $new_values, array('CandID' => $new_values['CandID']));
    }
}

