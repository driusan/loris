SET FOREIGN_KEY_CHECKS=0;
TRUNCATE violations_resolved;
LOAD DATA LOCAL INFILE 'violations_resolved.txt' INTO TABLE violations_resolved IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;