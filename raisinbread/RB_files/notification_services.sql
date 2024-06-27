SET FOREIGN_KEY_CHECKS=0;
TRUNCATE notification_services;
LOAD DATA LOCAL INFILE 'notification_services.txt' INTO TABLE notification_services IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;