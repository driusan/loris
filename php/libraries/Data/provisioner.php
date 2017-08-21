<?php
namespace LORIS\Data;

/**
 * A DataProvisioner is something which retrieves data from a source (usually
 * the database) and filters it. It represents arbitrarily structured data such
 * as a row in a table. Implementations know the details of the data, but a 
 * DataProvisioner itself only deals with ResourceInstances and filters.
 *
 * It In order to use this class, it must be extended and implement the
 * GetAllRows() function.
 */
abstract class Provisioner {
    /**
     * Filters to apply to this data before returning it to the user. 
     *
     * Filters generally do things like site based or project based permissions to
     * the data.
     *
     * @var DataFilter[]
     */
	protected $filters = [];


    /**
     * DataProvisioners are an immutable data structure with a fluent interface.
     *
     * They must have a new foo() constructor.
     */ 
	public function __construct() {
	}

    /**
     * Filter returns a new DataProvisioner which is identical to this one, except
     * also has the argument added as a data filter.
     */
    public function Filter(Filter $filter) : Provisioner {
        $d = clone $this;
        $d->filters[] = $filter;
        return $d;
    }

    /**
     * GetAllRows must be implemented in order to create a DataProvisioner.
     *
     * It gets all rows possible for this data type, regardless of permissions
     * or other details, which then get filtered before being returned to the
     * user.
     *
     * @return Instance[] array of all resources provided by this data source.
     */
	abstract protected function GetAllRows() : Iterable;

    /**
     * Execute gets the rows for this data source, and applies all
     * existing filters.
     *
     * @return Instance[]
     */
	public function Execute(\User $user) : Iterable {

            $rows = $this->getAllRows();
            $filters = $this->filters;

            return array_filter($rows,function($row) use ($user, $filters) {
                return array_reduce($filters, function($carry, $filter) use ($user, $row) {
                    return $carry && $filter->Filter($user, $row);
                }, true);
            });
	}
};
