SET FOREIGN_KEY_CHECKS=0;
TRUNCATE participant_status_history;
LOAD DATA LOCAL INFILE 'participant_status_history.txt' INTO TABLE participant_status_history IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;