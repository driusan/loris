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
     * the data, while mappers do things like anonymization of data.
     *
     * Filters and Maps are applied in the order that they're added to the
     * provisioner.
     *
     * @var array of Filters and/or Mappers, applied in sequence.
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
     * Apply returns a new Provisioner which is identical to this one, except
     * with the given map applied to the data.
     */
    public function Apply(Mapper $map) : Provisioner {
        $d = clone $this;
        $d->filters[] = $map;
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
	abstract protected function GetAllRows() : array;

    /**
     * Execute gets the rows for this data source, and applies all
     * existing filters.
     *
     * @return Instance[]
     */
	public function Execute(\User $user) : array {

            $rows = $this->getAllRows();
            $filters = $this->filters;

            foreach ($this->filters as $filter) {
                if ($filter instanceof Filter) {
                    $rows = array_filter($rows, function($row) use ($user, $filter) {
                        return $filter->Filter($user, $row);
                    });
                } else if ($filter instanceof Mapper) {
                    $rows = array_map(function($row) use ($user, $filter) {
                        return $filter->Map($user, $row);
                    }, $rows); 
                } else {
                    throw new \Exception("Invalid filter");
                }
            }
            return $rows;
	}
};
