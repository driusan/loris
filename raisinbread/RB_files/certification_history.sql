SET FOREIGN_KEY_CHECKS=0;
TRUNCATE certification_history;
LOAD DATA LOCAL INFILE 'certification_history.txt' INTO TABLE certification_history IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;