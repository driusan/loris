SET FOREIGN_KEY_CHECKS=0;
TRUNCATE diagnosis_evolution;
LOAD DATA LOCAL INFILE 'diagnosis_evolution.txt' INTO TABLE diagnosis_evolution IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;