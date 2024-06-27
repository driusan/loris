SET FOREIGN_KEY_CHECKS=0;
TRUNCATE feedback_bvl_thread;
LOAD DATA LOCAL INFILE 'feedback_bvl_thread.txt' INTO TABLE feedback_bvl_thread IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;