<?php
/**
* This file is used by the Configuration module to update
* or insert values into the Project table.
*
* PHP version 5
*
* @category Main
* @package  Loris
* @author   Bruno Da Rosa Miranda <bruno.darosamiranda@mail.mcgill.ca>
* @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
* @link     https://github.com/aces/Loris
*/

$user =& User::singleton();
if (!$user->hasPermission('config')) {
    header("HTTP/1.1 403 Forbidden");
    exit;
}

$db = Database::singleton();
$rows = $db->pselect("SELECT Test_name FROM test_names", array());
$tests = array();
foreach($rows as $row) {
    $tests[] = $row['Test_name'];
}
print json_encode($tests);
exit();
?>
