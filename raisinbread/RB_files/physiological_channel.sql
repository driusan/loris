SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_channel;
LOAD DATA LOCAL INFILE 'physiological_channel.txt' INTO TABLE physiological_channel IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;