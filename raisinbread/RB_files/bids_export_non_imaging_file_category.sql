SET FOREIGN_KEY_CHECKS=0;
TRUNCATE bids_export_non_imaging_file_category;
LOAD DATA LOCAL INFILE 'bids_export_non_imaging_file_category.txt' INTO TABLE bids_export_non_imaging_file_category IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;