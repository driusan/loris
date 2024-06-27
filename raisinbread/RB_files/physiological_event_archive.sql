SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_event_archive;
LOAD DATA LOCAL INFILE 'physiological_event_archive.txt' INTO TABLE physiological_event_archive IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;