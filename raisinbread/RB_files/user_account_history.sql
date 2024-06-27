SET FOREIGN_KEY_CHECKS=0;
TRUNCATE user_account_history;
LOAD DATA LOCAL INFILE 'user_account_history.txt' INTO TABLE user_account_history IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;