SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_coord_system;
LOAD DATA LOCAL INFILE 'physiological_coord_system.txt' INTO TABLE physiological_coord_system IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;