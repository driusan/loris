<?php echo '<?php';?> 
/**
 * LORIS data access object (DAO) template
 *
 * This class contains all database handling that is needed to
 * permanently store and retrieve <?php echo $this->class_name; ?> object instances.
 */
<?php echo "namespace LORIS\Data\Models\AccessObjects;\n"; ?>

<?php echo "use \LORIS\Data\Models\TransferObjects as DTO;\n" ?>

<?php echo "class $this->class_name implements \LORIS\Data\Models\AccessObject\n"; ?>
{
    /**
     * The logged in User object
     */
    private $_user;

    /**
     * A reference to the database connection object
     */
    private $_database;

    /*
     * The query string used to retrieve data from the database
     */
    private $_query;

    /**
     * Constructor
     */
    public function __construct()
    {
        $login = \SinglePointLogin::getInstance();

        $this->_user     = $login->getLoggedInUser();
        $this->_database = \NDB_Factory::singleton()->database();

        // Please fill _query with relevent query string
        $this->_query    = '
            SELECT
<?php
        echo '                '.join(",\n                ", $this->columns);
        echo "\n            FROM $this->table_name WHERE 1=1\n";
?>
        ';
    }

    /**
     * Instanciate and return a TransferObject matching the given primary key.
     *
     * @return DTO The requested object
     */
    public function getOne(array $primary_key): \LORIS\Data\Models\TransferObject
    {
        $sql_query =  $this->_query;
        $params = array();

        $values = $this->_database->pselectRow($sql_query, $params);

        if (empty($values)) {
            throw new \LorisException("This <?php echo $this->class_name; ?> does not exists.");
        }

        return new DTO\<?php echo $this->class_name; ?>($values);
    }

    /**
     * Instanciate and return all available objects.
     *
     * @return array<DTO> An array of transfer object
     */
    public function getAll()
    {
        $sql_query =  $this->_query;
        $params = array();

        $values = $this->_database->pselect($sql_query, $params);

        if (empty($values)) {
            throw new \LorisException("This <?php echo $this->class_name; ?> does not exists.");
        }

        return array_map(function($row) {
            return new DTO\<?php echo $this->class_name; ?>($row);
        }, $values);
    }

    /**
     * Update the database with new values 
     *
     * @param DTO $modifiedObject the modified object.
     *
     * @return void
     */
    public function save(\LORIS\Data\Models\TransferObject $modifiedObject)
    {
        $new_values = $modifiedObject->asArray();
        $this->_database->update('<?php echo $this->table_name; ?>', $new_values, $modifiedObject->getPrimaryKey());
    }
}
