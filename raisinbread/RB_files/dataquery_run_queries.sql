SET FOREIGN_KEY_CHECKS=0;
TRUNCATE dataquery_run_queries;
LOAD DATA LOCAL INFILE 'dataquery_run_queries.txt' INTO TABLE dataquery_run_queries IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;