SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_electrode_type;
LOAD DATA LOCAL INFILE 'physiological_electrode_type.txt' INTO TABLE physiological_electrode_type IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;