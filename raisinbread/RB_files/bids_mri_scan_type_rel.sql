SET FOREIGN_KEY_CHECKS=0;
TRUNCATE bids_mri_scan_type_rel;
LOAD DATA LOCAL INFILE 'bids_mri_scan_type_rel.txt' INTO TABLE bids_mri_scan_type_rel IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;