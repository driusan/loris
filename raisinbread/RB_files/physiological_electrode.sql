SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_electrode;
LOAD DATA LOCAL INFILE 'physiological_electrode.txt' INTO TABLE physiological_electrode IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;