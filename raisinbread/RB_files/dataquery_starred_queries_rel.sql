SET FOREIGN_KEY_CHECKS=0;
TRUNCATE dataquery_starred_queries_rel;
LOAD DATA LOCAL INFILE 'dataquery_starred_queries_rel.txt' INTO TABLE dataquery_starred_queries_rel IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;