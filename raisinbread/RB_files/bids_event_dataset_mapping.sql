SET FOREIGN_KEY_CHECKS=0;
TRUNCATE bids_event_dataset_mapping;
LOAD DATA LOCAL INFILE 'bids_event_dataset_mapping.txt' INTO TABLE bids_event_dataset_mapping IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;