SET FOREIGN_KEY_CHECKS=0;
TRUNCATE parameter_candidate;
LOAD DATA LOCAL INFILE 'parameter_candidate.txt' INTO TABLE parameter_candidate IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;