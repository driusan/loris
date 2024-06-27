SET FOREIGN_KEY_CHECKS=0;
TRUNCATE bids_scan_type_subcategory;
LOAD DATA LOCAL INFILE 'bids_scan_type_subcategory.txt' INTO TABLE bids_scan_type_subcategory IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;