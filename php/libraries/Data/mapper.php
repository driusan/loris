<?php
namespace LORIS\Data;

/**
 * A Mapper represents an object that maps from one instance type to another.
 * This may be used for things that modify the data, such as anonymization,
 * or dictionary translations for data submissions.
 */
interface Mapper {
    /**
     * Map returns a copy of $resource that has been modified in some way
     * without having modified the original..
     *
     * The data mapping is a function of the user that it's being mapped
     * for, and the data being mapped, in order to support features such
     * as permissions-based anonymization.
     */
	function Map(\User $user, Instance $resource) : Instance;
}
