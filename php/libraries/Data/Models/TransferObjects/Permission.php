<?php 
/**
 * LORIS DTO template
 *
 * Data Transfer Object (DTO).
 * It should be use to encapsulate all site related data and should
 * be used to transfer data between the application layer and the persistance
 * with minimal knowledge of what Permission does.
 */
namespace LORIS\Data\Models\TransferObjects;

class Permission extends \LORIS\Data\Models\TransferObject
{
    /**
     * This data is directly mapped to the columns of database table.
     */
    private $_permID;
    private $_code;
    private $_description;
    private $_categoryID;

    // Getters and Setters
    public function getpermID() {return $this->_permID;}
    public function setpermID($permID) {$this->_permID = $permID;}
    public function getcode() {return $this->_code;}
    public function setcode($code) {$this->_code = $code;}
    public function getdescription() {return $this->_description;}
    public function setdescription($description) {$this->_description = $description;}
    public function getcategoryID() {return $this->_categoryID;}
    public function setcategoryID($categoryID) {$this->_categoryID = $categoryID;}

    // Shortcut to avoid the use of setters during instanciation.
    private function _setAll(array &$allVals) {
        $this->_permID = $allVals['permID'];
        $this->_code = $allVals['code'];
        $this->_description = $allVals['description'];
        $this->_categoryID = $allVals['categoryID'];
    }

    /**
     *
     */
    public function getPrimaryKey()
    {
        $keys = array(
            'permID' => $this->_permID,
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
