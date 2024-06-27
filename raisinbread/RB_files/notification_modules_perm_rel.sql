SET FOREIGN_KEY_CHECKS=0;
TRUNCATE notification_modules_perm_rel;
LOAD DATA LOCAL INFILE 'notification_modules_perm_rel.txt' INTO TABLE notification_modules_perm_rel IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;