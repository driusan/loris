SET FOREIGN_KEY_CHECKS=0;
TRUNCATE issues_comments_history;
LOAD DATA LOCAL INFILE 'issues_comments_history.txt' INTO TABLE issues_comments_history IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;