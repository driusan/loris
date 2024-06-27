SET FOREIGN_KEY_CHECKS=0;
TRUNCATE publication_upload_type;
LOAD DATA LOCAL INFILE 'publication_upload_type.txt' INTO TABLE publication_upload_type IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;