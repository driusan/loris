<?php
namespace LORIS\Data\Models;

abstract class TransferObject
{
    /**
     * Provide an key-value array of column name member of that table primary key
     * 
     * @return array A list of column name
     */
    abstract public function getPrimaryKey();

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
        return json_encode($this->asArray());
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
        $object_vars = get_object_vars($this);

        // Remove the '_' prefix from the keys
        $new_keys = array_map(function($key) {return ltrim($key, '_'); }, array_keys($object_vars));

        return array_combine($new_keys, array_values($object_vars));
    }

}
