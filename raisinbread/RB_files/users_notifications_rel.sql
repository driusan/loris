SET FOREIGN_KEY_CHECKS=0;
TRUNCATE users_notifications_rel;
LOAD DATA LOCAL INFILE 'users_notifications_rel.txt' INTO TABLE users_notifications_rel IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;