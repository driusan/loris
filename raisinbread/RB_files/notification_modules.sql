SET FOREIGN_KEY_CHECKS=0;
TRUNCATE notification_modules;
LOAD DATA LOCAL INFILE 'notification_modules.txt' INTO TABLE notification_modules IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;