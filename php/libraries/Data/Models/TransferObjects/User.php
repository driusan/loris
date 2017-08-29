<?php 
/**
 * LORIS DTO template
 *
 * Data Transfer Object (DTO).
 * It should be use to encapsulate all site related data and should
 * be used to transfer data between the application layer and the persistance
 * with minimal knowledge of what User does.
 */
namespace LORIS\Data\Models\TransferObjects;

class User extends \LORIS\Data\Models\TransferObject
{
    /**
     * This data is directly mapped to the columns of database table.
     */
    private $_ID;
    private $_UserID;
    private $_Password;
    private $_Real_name;
    private $_First_name;
    private $_Last_name;
    private $_Degree;
    private $_Position_title;
    private $_Institution;
    private $_Department;
    private $_Address;
    private $_City;
    private $_State;
    private $_Zip_code;
    private $_Country;
    private $_Fax;
    private $_Email;
    private $_CenterID;
    private $_Privilege;
    private $_PSCPI;
    private $_DBAccess;
    private $_Active;
    private $_Password_hash;
    private $_Password_expiry;
    private $_Pending_approval;
    private $_Doc_Repo_Notifications;
    private $_Phone;

    // Getters and Setters
    public function getID() {return $this->_ID;}
    public function setID($ID) {$this->_ID = $ID;}
    public function getUserID() {return $this->_UserID;}
    public function setUserID($UserID) {$this->_UserID = $UserID;}
    public function getPassword() {return $this->_Password;}
    public function setPassword($Password) {$this->_Password = $Password;}
    public function getReal_name() {return $this->_Real_name;}
    public function setReal_name($Real_name) {$this->_Real_name = $Real_name;}
    public function getFirst_name() {return $this->_First_name;}
    public function setFirst_name($First_name) {$this->_First_name = $First_name;}
    public function getLast_name() {return $this->_Last_name;}
    public function setLast_name($Last_name) {$this->_Last_name = $Last_name;}
    public function getDegree() {return $this->_Degree;}
    public function setDegree($Degree) {$this->_Degree = $Degree;}
    public function getPosition_title() {return $this->_Position_title;}
    public function setPosition_title($Position_title) {$this->_Position_title = $Position_title;}
    public function getInstitution() {return $this->_Institution;}
    public function setInstitution($Institution) {$this->_Institution = $Institution;}
    public function getDepartment() {return $this->_Department;}
    public function setDepartment($Department) {$this->_Department = $Department;}
    public function getAddress() {return $this->_Address;}
    public function setAddress($Address) {$this->_Address = $Address;}
    public function getCity() {return $this->_City;}
    public function setCity($City) {$this->_City = $City;}
    public function getState() {return $this->_State;}
    public function setState($State) {$this->_State = $State;}
    public function getZip_code() {return $this->_Zip_code;}
    public function setZip_code($Zip_code) {$this->_Zip_code = $Zip_code;}
    public function getCountry() {return $this->_Country;}
    public function setCountry($Country) {$this->_Country = $Country;}
    public function getFax() {return $this->_Fax;}
    public function setFax($Fax) {$this->_Fax = $Fax;}
    public function getEmail() {return $this->_Email;}
    public function setEmail($Email) {$this->_Email = $Email;}
    public function getCenterID() {return $this->_CenterID;}
    public function setCenterID($CenterID) {$this->_CenterID = $CenterID;}
    public function getPrivilege() {return $this->_Privilege;}
    public function setPrivilege($Privilege) {$this->_Privilege = $Privilege;}
    public function getPSCPI() {return $this->_PSCPI;}
    public function setPSCPI($PSCPI) {$this->_PSCPI = $PSCPI;}
    public function getDBAccess() {return $this->_DBAccess;}
    public function setDBAccess($DBAccess) {$this->_DBAccess = $DBAccess;}
    public function getActive() {return $this->_Active;}
    public function setActive($Active) {$this->_Active = $Active;}
    public function getPassword_hash() {return $this->_Password_hash;}
    public function setPassword_hash($Password_hash) {$this->_Password_hash = $Password_hash;}
    public function getPassword_expiry() {return $this->_Password_expiry;}
    public function setPassword_expiry($Password_expiry) {$this->_Password_expiry = $Password_expiry;}
    public function getPending_approval() {return $this->_Pending_approval;}
    public function setPending_approval($Pending_approval) {$this->_Pending_approval = $Pending_approval;}
    public function getDoc_Repo_Notifications() {return $this->_Doc_Repo_Notifications;}
    public function setDoc_Repo_Notifications($Doc_Repo_Notifications) {$this->_Doc_Repo_Notifications = $Doc_Repo_Notifications;}
    public function getPhone() {return $this->_Phone;}
    public function setPhone($Phone) {$this->_Phone = $Phone;}

    // Shortcut to avoid the use of setters during instanciation.
    private function _setAll(array &$allVals) {
        $this->_ID = $allVals['ID'];
        $this->_UserID = $allVals['UserID'];
        $this->_Password = $allVals['Password'];
        $this->_Real_name = $allVals['Real_name'];
        $this->_First_name = $allVals['First_name'];
        $this->_Last_name = $allVals['Last_name'];
        $this->_Degree = $allVals['Degree'];
        $this->_Position_title = $allVals['Position_title'];
        $this->_Institution = $allVals['Institution'];
        $this->_Department = $allVals['Department'];
        $this->_Address = $allVals['Address'];
        $this->_City = $allVals['City'];
        $this->_State = $allVals['State'];
        $this->_Zip_code = $allVals['Zip_code'];
        $this->_Country = $allVals['Country'];
        $this->_Fax = $allVals['Fax'];
        $this->_Email = $allVals['Email'];
        $this->_CenterID = $allVals['CenterID'];
        $this->_Privilege = $allVals['Privilege'];
        $this->_PSCPI = $allVals['PSCPI'];
        $this->_DBAccess = $allVals['DBAccess'];
        $this->_Active = $allVals['Active'];
        $this->_Password_hash = $allVals['Password_hash'];
        $this->_Password_expiry = $allVals['Password_expiry'];
        $this->_Pending_approval = $allVals['Pending_approval'];
        $this->_Doc_Repo_Notifications = $allVals['Doc_Repo_Notifications'];
        $this->_Phone = $allVals['Phone'];
    }

    /**
     *
     */
    public function getPrimaryKey()
    {
        $keys = array(
            'ID' => $this->_ID,
        );
    }

    /**
     * Constructor
     */
    public function __construct(array &$allVals)
    {
        $this->_setAll($allVals);
    }

    /**
     * The __toString() method allows a class to decide how it will react when it
     * is treated like a string. For example, what echo $obj; will print. This
     * method must return a string, as otherwise a fatal E_RECOVERABLE_ERROR level
     * error is emitted. 
     *
     * @note You cannot throw an exception from within a __toString() method. Doing
     *       so will result in a fatal error. 
     *
     * @return string A string representation of the object.
     */
    public function __toString()
    {
        try {
            return json_encode($this->asArray());
        } catch (Exception $e) {
            trigger_error($e->getMessage(), E_RECOVERABLE_ERROR);
        }
    }

    /**
     * This methods return an array representation of the object. This object
     * properties can be white listed using the model_variables properties.
     *
     * @return array An array representation of the object
     */
    public function asArray()
    {
        // get all object vars
        $vars = $this->model_variables ?? get_object_vars($this);

        // Remove the '_' prefix from the keys
        $new_keys = array_map(function($key) {return ltrim($key, '_'); }, array_keys($vars));

        return array_combine($new_keys, array_values($vars));
    }
}
