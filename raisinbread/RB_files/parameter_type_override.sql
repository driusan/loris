SET FOREIGN_KEY_CHECKS=0;
TRUNCATE parameter_type_override;
LOAD DATA LOCAL INFILE 'parameter_type_override.txt' INTO TABLE parameter_type_override IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;