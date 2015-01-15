<?php
//Load config file and ensure paths are correct
set_include_path(get_include_path() . ":" . __DIR__);
require_once 'APIBase.php';

class InstrumentJSON extends APIBase {
    function __construct($Instrument) {
        parent::__construct();

        require_once 'NDB_BVL_Instrument.class.inc';

        try {
            $a = NDB_BVL_Instrument::factory($Instrument, null, null, true);
            $this->JSON = json_decode($a->toJSON());
        } catch(Exception $e) {
            header("HTTP/1.1 404 Not Found");
        }

    }
}


$obj = new InstrumentJSON($_REQUEST['Instrument']);
print $obj->toJSONString();
?>
