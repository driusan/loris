<?php 
/**
 * LORIS data access object (DAO) template
 *
 * This class contains all database handling that is needed to
 * permanently store and retrieve Permission object instances.
 */
namespace LORIS\Data\Models\AccessObjects;

use \LORIS\Data\Models\TransferObjects as DTO;

class Permission implements \LORIS\Data\Models\AccessObject
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
                permID,
                code,
                description,
                categoryID
            FROM permissions WHERE 1=1
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
        $params = array();

        $values = $this->_database->pselectRow($sql_query, $params);

        if (empty($values)) {
            throw new \LorisException("This Permission does not exists.");
        }

        return new DTO\Permission($values);
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
            throw new \LorisException("This Permission does not exists.");
        }

        return array_map(function($row) {
            return new DTO\Permission($row);
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
        $this->_database->update('permissions', $new_values, $modifiedObject->getPrimaryKey());
    }
}
