<?php
/**
 * Candidate Data Access Object (DAO).
 *
 * This class contains all database handling that is needed to 
 * permanently store and retrieve Candidate object instances.
 */
namespace LORIS\Data\Models\AccessObjects;

use \LORIS\Data\Models\TransferObjects as DTO;

class Site implements \LORIS\Data\Models\AccessObject
{
    private $_user;
    private $_database;
    private $_query;

    private $_cache; 

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
                CenterID,
                Name,
                PSCArea,
                Address,
                City,
                StateID,
                ZIP,
                Phone1,
                Phone2,
                Contact1,
                Contact2,
                Alias,
                MRI_alias,
                Account,
                Study_site
            FROM psc
            WHERE 1=1
        ';
    }

    /**
     * Instanciate and return a TransferObject matching the given primary key.
     *
     * @return DTO The requested object
     */
    public function getOne(array $primary_key)
    {
        $hash = md5(json_encode($primary_key));
        if (empty($this->_cache[$hash])) {
            $sql_query =  $this->_query;
            $sql_query .= ' AND CenterID = :CenterID ';
            $params = $primary_key;
    
            $values = $this->_database->pselectRow($sql_query, $params);
    
            if (empty($values)) {
                throw new \LorisException("This candidate does not exists.");
            }
    
            $this->_cache[$hash] = new DTO\Site($values);
        }
        return $this->_cache[$hash];
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

        $values = $this->_database->pselect($sql_query, $params);

        if (empty($values)) {
            throw new \LorisException("No candidate");
        }

        return array_map(function($row) {
            return new DTO\Site($row);
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
        $this->_database->update('psc', $new_values, array('CenterId' => $new_values['CenterID']));
    }
}

