<?php
namespace LORIS\Data;

/**
 * A Table Represents a table displayed on the frontend to a user.
 */
class Table {
    /**
     * @var \LORIS\Data\Provisioner
     */
    protected $dataProvider;

    public function __construct() {
    }

    /**
     * Returns a new Table which is identical to this one, except gets its
     * data from the DataProvisioner provided.
     */
    public function WithDataFrom(\LORIS\Data\Provisioner $provisioner) : Table {
        $t = clone $this;
        $t->dataProvider = $provisioner;
        return $t;
    }

    /**
     * Get rows returns all rows that the data provider provides, filtering them
     * for $user.
     *
     * @return \LORIS\Data\Instance[] of all the filtered data.
     */
    public function getRows(\User $user) : array {
       return $this->dataProvider->execute($user); 
    }

    /**
     * Returns a PHP array which mirror's the format of toJSON (rather than
     * an array of data Instances, as getRows returns.)
     */
    public function toArray(\User $user) : array {
        $allRows = $this->getRows($user);

        $results = [];
        foreach ($allRows as $row) {
            $results[] = $row->toArray($user);   
        }
        return $results;
    }
    /**
     * Serializes this table to JSON for $user.
     */
    public function toJSON(\User $user) : string {
        return json_encode($this->toArray($user));
    }

    /**
     * Filter returns a new table with DataFilter added as a filter.
     */
    public function Filter(\LORIS\Data\Filter $filter) : Table {
        $t = clone $this;
        $t->dataProvider = $this->dataProvider->Filter($filter);
        return $t;
        /* FIXME: Add another method which takes a callback function instead to
         * simplify usage./
        $t->Filter(new class() implements DataFilter {
            public function Filter(DataResource $resource) : bool {
                return $callable($resource);
            }
        });
         */
    }
}
