<?php 
/**
 * LORIS DTO template
 *
 * Data Transfer Object (DTO).
 * It should be use to encapsulate all site related data and should
 * be used to transfer data between the application layer and the persistance
 * with minimal knowledge of what Site does.
 */
namespace LORIS\Data\Models\TransferObjects;

class Site extends \LORIS\Data\Models\TransferObject
{
    /**
     * This data is directly mapped to the columns of database table.
     */
    private $_CenterID;
    private $_Name;
    private $_PSCArea;
    private $_Address;
    private $_City;
    private $_StateID;
    private $_ZIP;
    private $_Phone1;
    private $_Phone2;
    private $_Contact1;
    private $_Contact2;
    private $_Alias;
    private $_MRI_alias;
    private $_Account;
    private $_Study_site;

    // Getters and Setters
    public function getCenterID() {return $this->_CenterID;}
    public function setCenterID($CenterID) {$this->_CenterID = $CenterID;}
    public function getName() {return $this->_Name;}
    public function setName($Name) {$this->_Name = $Name;}
    public function getPSCArea() {return $this->_PSCArea;}
    public function setPSCArea($PSCArea) {$this->_PSCArea = $PSCArea;}
    public function getAddress() {return $this->_Address;}
    public function setAddress($Address) {$this->_Address = $Address;}
    public function getCity() {return $this->_City;}
    public function setCity($City) {$this->_City = $City;}
    public function getStateID() {return $this->_StateID;}
    public function setStateID($StateID) {$this->_StateID = $StateID;}
    public function getZIP() {return $this->_ZIP;}
    public function setZIP($ZIP) {$this->_ZIP = $ZIP;}
    public function getPhone1() {return $this->_Phone1;}
    public function setPhone1($Phone1) {$this->_Phone1 = $Phone1;}
    public function getPhone2() {return $this->_Phone2;}
    public function setPhone2($Phone2) {$this->_Phone2 = $Phone2;}
    public function getContact1() {return $this->_Contact1;}
    public function setContact1($Contact1) {$this->_Contact1 = $Contact1;}
    public function getContact2() {return $this->_Contact2;}
    public function setContact2($Contact2) {$this->_Contact2 = $Contact2;}
    public function getAlias() {return $this->_Alias;}
    public function setAlias($Alias) {$this->_Alias = $Alias;}
    public function getMRI_alias() {return $this->_MRI_alias;}
    public function setMRI_alias($MRI_alias) {$this->_MRI_alias = $MRI_alias;}
    public function getAccount() {return $this->_Account;}
    public function setAccount($Account) {$this->_Account = $Account;}
    public function getStudy_site() {return $this->_Study_site;}
    public function setStudy_site($Study_site) {$this->_Study_site = $Study_site;}

    // Shortcut to avoid the use of setters during instanciation.
    private function _setAll(array &$allVals) {
        $this->_CenterID = $allVals['CenterID'];
        $this->_Name = $allVals['Name'];
        $this->_PSCArea = $allVals['PSCArea'];
        $this->_Address = $allVals['Address'];
        $this->_City = $allVals['City'];
        $this->_StateID = $allVals['StateID'];
        $this->_ZIP = $allVals['ZIP'];
        $this->_Phone1 = $allVals['Phone1'];
        $this->_Phone2 = $allVals['Phone2'];
        $this->_Contact1 = $allVals['Contact1'];
        $this->_Contact2 = $allVals['Contact2'];
        $this->_Alias = $allVals['Alias'];
        $this->_MRI_alias = $allVals['MRI_alias'];
        $this->_Account = $allVals['Account'];
        $this->_Study_site = $allVals['Study_site'];
    }

    /**
     *
     */
    public function getPrimaryKey()
    {
        $keys = array(
            'CenterID' => $this->_CenterID(),
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
