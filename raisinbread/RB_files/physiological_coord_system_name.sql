SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_coord_system_name;
LOAD DATA LOCAL INFILE 'physiological_coord_system_name.txt' INTO TABLE physiological_coord_system_name IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;