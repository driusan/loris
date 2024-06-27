SET FOREIGN_KEY_CHECKS=0;
TRUNCATE notification_history;
LOAD DATA LOCAL INFILE 'notification_history.txt' INTO TABLE notification_history IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;