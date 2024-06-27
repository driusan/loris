SET FOREIGN_KEY_CHECKS=0;
TRUNCATE mri_protocol_violated_scans;
LOAD DATA LOCAL INFILE 'mri_protocol_violated_scans.txt' INTO TABLE mri_protocol_violated_scans IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;