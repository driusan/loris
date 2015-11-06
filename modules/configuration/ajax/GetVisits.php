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

if(!isset($_GET['SubprojectID'])) {
    header("HTTP/1.1 400 Bad Request");
    exit;
}
$db = Database::singleton();
$rows = $db->pselect("SELECT Visit_label, Test_name FROM test_battery WHERE SubprojectID=:SPID AND Visit_label IS NOT NULL", array('SPID' => $_GET['SubprojectID']));
$tests = array();
foreach($rows as $row) {
    if(empty($tests[$row['Visit_label']])) {
        $tests[$row['Visit_label']] = array();
    }
    $tests[$row['Visit_label']][] = $row['Test_name'];
}
print json_encode($tests);
exit();
?>
