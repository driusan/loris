SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_channel_type;
LOAD DATA LOCAL INFILE 'physiological_channel_type.txt' INTO TABLE physiological_channel_type IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;