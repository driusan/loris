SET FOREIGN_KEY_CHECKS=0;
TRUNCATE dataquery_run_results;
LOAD DATA LOCAL INFILE 'dataquery_run_results.txt' INTO TABLE dataquery_run_results IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;