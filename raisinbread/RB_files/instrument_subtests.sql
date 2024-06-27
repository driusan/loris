SET FOREIGN_KEY_CHECKS=0;
TRUNCATE instrument_subtests;
LOAD DATA LOCAL INFILE 'instrument_subtests.txt' INTO TABLE instrument_subtests IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;