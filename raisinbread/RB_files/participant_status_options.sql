SET FOREIGN_KEY_CHECKS=0;
TRUNCATE participant_status_options;
LOAD DATA LOCAL INFILE 'participant_status_options.txt' INTO TABLE participant_status_options IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;