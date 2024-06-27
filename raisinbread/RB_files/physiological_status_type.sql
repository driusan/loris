SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_status_type;
LOAD DATA LOCAL INFILE 'physiological_status_type.txt' INTO TABLE physiological_status_type IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;