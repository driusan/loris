SET FOREIGN_KEY_CHECKS=0;
TRUNCATE feedback_mri_predefined_comments;
LOAD DATA LOCAL INFILE 'feedback_mri_predefined_comments.txt' INTO TABLE feedback_mri_predefined_comments IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;