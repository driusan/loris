<?php
/**
 * This file defines the concept of a data Provisioner.
 *
 * PHP Version 7
 *
 * @category   Data
 * @package    Main
 * @subpackage Data
 * @author     Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
namespace LORIS\Data;

/**
 * A Provisioner is something which retrieves data from a source (usually
 * the SQL database) and applies filters or maps to the data. It represents
 * arbitrarily structured data such as a row in a table. Implementations
 * know the details of the data, but a Provisioner itself only deals with
 * Instance objects, Filters and Mappers.
 *
 * Filters generally do things like site based or project based permissions to
 * the data, while mappers do things like anonymization of data.
 *
 * It In order to use this class, it must be extended and the child must
 * implement the GetAllRows() function, which should try and .
 *
 * @category   Data
 * @package    Main
 * @subpackage Data
 * @author     Dave MacFarlane <david.macfarlane2@mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
abstract class Provisioner
{
    private $parent = null;
    private $resultCache;
    /**
     * Filters (and Mappers) to apply to the data from this Provisioner
     * before returning it to the user.
     *
     * Filters and Maps are lazily evaluated, and applied in the order that
     * they were added to the Provisioner.
     *
     * @var array of Filters and/or Mappers.
     */
    private $_filters = [];

    /**
     * Filter returns a new Provisioner which is identical to this one, except
     * also has the argument added as a data filter.
     *
     * @param Filter $filter The filter to apply
     *
     * @return Provisioner a new data provisioner with $filter applied
     */
    public function filter(Filter $filter) : Provisioner
    {
        $d = clone $this;
        $d->parent = &$this;
        $d->_filters = [$filter];
        return $d;
    }

    /**
     * Map returns a new Provisioner which is identical to this one, except
     * with the given map applied to the data.
     *
     * @param Mapper $map The map to apply
     *
     * @return Provisioner a new data provisioner with $map applied
     */
    public function map(Mapper $map) : Provisioner
    {
        $d = clone $this;
        $d->parent = &$this;
        $d->isExecuted = false;
        $d->_filters = [$map];
        return $d;
    }

    /**
     * GetAllInstances must be implemented in order to create a Provisioner.
     *
     * It gets all rows possible for this data type, which are then Filtered
     * and Mapped when Execute is called.
     *
     * @return Instance[] array of all resources provided by this data source.
     */
    abstract protected function getAllInstances() : \Traversable;

    /**
     * Execute gets the rows for this data source, and applies all
     * existing Filters and Maps.
     *
     * @param \User $user The user who data is being provisioned on behalf of.
     *
     * @return Instance[]
     */
    public function execute(\User $user) : \Traversable
    {
        $rows = new \EmptyIterator();
        if ($this->parent != null) {
            $rows = $this->parent->execute($user);
        } else {
            $rows = $this->getAllInstances();
        }

        $i = 0;
        foreach ($this->_filters as $filter) {
            $i++;
            $ranFilter = false;
            if ($filter instanceof Filter) {
                $ranFilter = true;

                $callback = function($current, $key, $iterator) use ($filter, $user) {
                    return $filter->Filter($user, $current);
                };
                $rows = new \CallbackFilterIterator(new \IteratorIterator($rows), $callback);
                /*
                $rows = array_filter(
                    $rows,
                    function ($row) use ($user, $filter) {
                            return $filter->Filter($user, $row);
                    }
                );
                 */
            }
            if ($filter instanceof Mapper) {
                $ranFilter = true;
                $rows = new class($rows, $filter, $user) extends \IteratorIterator {
                    protected $filters;
                    protected $user;
                    public function __construct($rows, $filter, $user) {
                        parent::__construct($rows);
                        $this->filter= $filter;
                        $this->usr = $user;
                    }
                    public function current() {
                        $row = parent::current();
                        return $this->filter->Map($this->usr, $row);
                    }
                };

                       /*
                $rows = array_map(
                    function ($row) use ($user,
                        $filter
                    ) {
                            return $filter->Map($user, $row);
                    },
                    $rows
                );
                        */
            }
           
           if ($ranFilter !== true) {
                throw new \Exception("Invalid filter");
            }
        }
        return $rows;
    }
};
