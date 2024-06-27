SET FOREIGN_KEY_CHECKS=0;
TRUNCATE testnames_permissions_rel;
LOAD DATA LOCAL INFILE 'testnames_permissions_rel.txt' INTO TABLE testnames_permissions_rel IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;