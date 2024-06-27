SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_modality;
LOAD DATA LOCAL INFILE 'physiological_modality.txt' INTO TABLE physiological_modality IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;