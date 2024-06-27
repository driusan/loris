SET FOREIGN_KEY_CHECKS=0;
TRUNCATE genotyping_platform;
LOAD DATA LOCAL INFILE 'genotyping_platform.txt' INTO TABLE genotyping_platform IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;