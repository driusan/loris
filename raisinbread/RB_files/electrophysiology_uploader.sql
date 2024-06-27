SET FOREIGN_KEY_CHECKS=0;
TRUNCATE electrophysiology_uploader;
LOAD DATA LOCAL INFILE 'electrophysiology_uploader.txt' INTO TABLE electrophysiology_uploader IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;