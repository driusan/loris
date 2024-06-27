SET FOREIGN_KEY_CHECKS=0;
TRUNCATE mri_protocol_checks;
LOAD DATA LOCAL INFILE 'mri_protocol_checks.txt' INTO TABLE mri_protocol_checks IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;