<?php
namespace LORIS\Data;

/**
 * A ResourceInstance represents a single record returned from a DataProvisioner.
 * Resources must be serializable to JSON, but the JSON content is flexible.
 */
abstract class Instance {
    /**
     * ToJSON must serialize this resource instance to a string of valid JSON.
     */
    function ToJSON() : string {
        return json_encode($this->toArray());
    }

    abstract function ToArray() : array;
};
