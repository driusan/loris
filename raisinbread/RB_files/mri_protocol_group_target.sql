SET FOREIGN_KEY_CHECKS=0;
TRUNCATE mri_protocol_group_target;
LOAD DATA LOCAL INFILE 'mri_protocol_group_target.txt' INTO TABLE mri_protocol_group_target IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;