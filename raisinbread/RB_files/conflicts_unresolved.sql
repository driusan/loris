SET FOREIGN_KEY_CHECKS=0;
TRUNCATE conflicts_unresolved;
LOAD DATA LOCAL INFILE 'conflicts_unresolved.txt' INTO TABLE conflicts_unresolved IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;