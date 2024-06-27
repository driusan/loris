SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_coord_system_electrode_rel;
LOAD DATA LOCAL INFILE 'physiological_coord_system_electrode_rel.txt' INTO TABLE physiological_coord_system_electrode_rel IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;