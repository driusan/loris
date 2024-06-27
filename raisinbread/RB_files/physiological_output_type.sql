SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_output_type;
LOAD DATA LOCAL INFILE 'physiological_output_type.txt' INTO TABLE physiological_output_type IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;