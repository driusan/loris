SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_coord_system_unit;
LOAD DATA LOCAL INFILE 'physiological_coord_system_unit.txt' INTO TABLE physiological_coord_system_unit IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;