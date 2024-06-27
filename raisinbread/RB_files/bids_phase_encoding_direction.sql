SET FOREIGN_KEY_CHECKS=0;
TRUNCATE bids_phase_encoding_direction;
LOAD DATA LOCAL INFILE 'bids_phase_encoding_direction.txt' INTO TABLE bids_phase_encoding_direction IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;