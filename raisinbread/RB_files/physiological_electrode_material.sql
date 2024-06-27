SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_electrode_material;
LOAD DATA LOCAL INFILE 'physiological_electrode_material.txt' INTO TABLE physiological_electrode_material IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;