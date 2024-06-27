SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_event_parameter;
LOAD DATA LOCAL INFILE 'physiological_event_parameter.txt' INTO TABLE physiological_event_parameter IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;