SET FOREIGN_KEY_CHECKS=0;
TRUNCATE permissions_category;
LOAD DATA LOCAL INFILE 'permissions_category.txt' INTO TABLE permissions_category IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;