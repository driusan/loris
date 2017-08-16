<?php
namespace LORIS\Data;

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
