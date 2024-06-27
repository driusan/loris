SET FOREIGN_KEY_CHECKS=0;
TRUNCATE candidate_consent_history;
LOAD DATA LOCAL INFILE 'candidate_consent_history.txt' INTO TABLE candidate_consent_history IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;