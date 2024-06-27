SET FOREIGN_KEY_CHECKS=0;
TRUNCATE data_release_permissions;
LOAD DATA LOCAL INFILE 'data_release_permissions.txt' INTO TABLE data_release_permissions IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;