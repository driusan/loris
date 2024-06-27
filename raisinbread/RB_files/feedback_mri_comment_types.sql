SET FOREIGN_KEY_CHECKS=0;
TRUNCATE feedback_mri_comment_types;
LOAD DATA LOCAL INFILE 'feedback_mri_comment_types.txt' INTO TABLE feedback_mri_comment_types IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;