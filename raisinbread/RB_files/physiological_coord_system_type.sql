SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_coord_system_type;
LOAD DATA LOCAL INFILE 'physiological_coord_system_type.txt' INTO TABLE physiological_coord_system_type IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;