SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_parameter_file;
LOAD DATA LOCAL INFILE 'physiological_parameter_file.txt' INTO TABLE physiological_parameter_file IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;