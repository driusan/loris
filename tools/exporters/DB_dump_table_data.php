#!/usr/bin/env php
<?php declare(strict_types=1);
/**
 * This script generates data-only dumps for all tables
 * in the currently active database.
 * Each table in the database gets dumped into a single file
 * in the following location :
 * BASE_PATH_TO_LORIS/test/RBfiles/RB_TABLE_NAME.sql
 *
 * This script was primarily written to simplify contributions
 * to the raisinbread dataset.
 * Each file contains data TRUNCATION, table LOCKING, and individual INSERTS for each
 * row. This is done by design to allow for an easier review of the changes through
 * a VCS system.
 *
 * note: this script currently depends on the existence of a mysql configuration file
 * allowing to dump data using only the database name. The functionality to input
 * credentials interactively should be added.
 *
 * PHP Version 7
 *
 * @category Main
 * @package  Loris
 * @author   Rida Abou-Haidar <rida.abou-haidar@mcin.ca>
 * @license  Loris license
 * @link     https://www.github.com/aces/Loris/
 */
require_once __DIR__ . '/../generic_includes.php';

$config       = NDB_Config::singleton();
$databaseInfo = $config->getSetting('database');

$tableNames = [];

$allTables = $DB->pselectCol(
    "SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA =:dbn",
    ["dbn"=>$databaseInfo['database']]
);

if ($argc < 2) {
    $tableNames = $allTables;
} else {
    $tableNames = array_slice($argv, 1);
    $hasErr     = false;
    foreach ($tableNames as $table) {
        if (!in_array($table, $allTables, true)) {
            fprintf(STDERR, "Invalid table $table\n");
            $hasErr = true;
        }
    }
    if ($hasErr) {
        exit(1);
    }
}

$adminUser     = $databaseInfo["adminUser"];
$adminPassword = $databaseInfo["adminPassword"];
$dbHost        = $databaseInfo["host"];

if (empty($adminUser) || empty($adminPassword) || empty($dbHost)) {
    echo "\n\n Some database credentials are missing, please ensure administrator 
    credentials (adminUser, adminPassword) and a host value are available in your 
    configuration file. \n\n";
    die();
}

foreach ($tableNames as $tableName) {
    $paths    = \NDB_Config::singleton()->getSetting('paths');
    $filename = $paths['base'] . "/raisinbread/RB_files/$tableName.txt";
    exec(
        'mysql -u '.escapeshellarg($adminUser).
        ' -p'.escapeshellarg($adminPassword).' -h '.escapeshellarg($dbHost).' '.
        escapeshellarg($databaseInfo['database']).' '.
        "-e ". escapeshellarg("SELECT * FROM $tableName")
        . ' | sed -e ' . escapeshellarg("s/NULL/\\\\N/g") . " > $filename"
    );

    /*
    exec(
        'mysql -u '.escapeshellarg($adminUser).
        ' -p'.escapeshellarg($adminPassword).' -h '.escapeshellarg($dbHost).' '.
        escapeshellarg($databaseInfo['database']).' '.
        "-e ". escapeshellarg("SELECT * FROM $tableName")
        . ' > '. $filename
    );
    $filename = $paths['base'] . "/raisinbread/RB_files/$tableName.sql";
    $fp = fopen($filename, "w");
    fwrite($fp, <<<EOF
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE $tableName;
LOAD DATA LOCAL INFILE '$tableName.txt' INTO TABLE $tableName IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;
EOF);
     */
}
