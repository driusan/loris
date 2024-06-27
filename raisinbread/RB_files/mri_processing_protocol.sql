SET FOREIGN_KEY_CHECKS=0;
TRUNCATE mri_processing_protocol;
LOAD DATA LOCAL INFILE 'mri_processing_protocol.txt' INTO TABLE mri_processing_protocol IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;