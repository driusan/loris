SET FOREIGN_KEY_CHECKS=0;
TRUNCATE candidate_consent_rel;
LOAD DATA LOCAL INFILE 'candidate_consent_rel.txt' INTO TABLE candidate_consent_rel IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;