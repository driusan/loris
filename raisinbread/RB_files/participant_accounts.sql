SET FOREIGN_KEY_CHECKS=0;
TRUNCATE participant_accounts;
LOAD DATA LOCAL INFILE 'participant_accounts.txt' INTO TABLE participant_accounts IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;