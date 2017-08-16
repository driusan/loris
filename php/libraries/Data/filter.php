<?php
/**
 * The LORIS\Data namespace contains interfaces and classes used to extract and filter
 * data. It implements the framework for permission based filtering.
 */
namespace LORIS\Data;

/**
 * A DataFilter represents a ruleset for whether or not data should be filtered out
 * of a DataProvisioner. It generally is used for things like verifying permissions
 * in a provisioner.
 */
interface Filter {
    /**
     * Filter returns true iff the resource should be filtered out of the results
     * displayed to user.
     */
	function Filter(\Loris\User $user, Instance $resource) : bool;
}
