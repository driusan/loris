SET FOREIGN_KEY_CHECKS=0;
TRUNCATE genomic_candidate_files_rel;
LOAD DATA LOCAL INFILE 'genomic_candidate_files_rel.txt' INTO TABLE genomic_candidate_files_rel IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;