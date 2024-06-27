SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_split_file;
LOAD DATA LOCAL INFILE 'physiological_split_file.txt' INTO TABLE physiological_split_file IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;