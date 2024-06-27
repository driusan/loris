SET FOREIGN_KEY_CHECKS=0;
TRUNCATE dataquery_query_names;
LOAD DATA LOCAL INFILE 'dataquery_query_names.txt' INTO TABLE dataquery_query_names IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;