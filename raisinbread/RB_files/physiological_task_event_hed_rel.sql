SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_task_event_hed_rel;
LOAD DATA LOCAL INFILE 'physiological_task_event_hed_rel.txt' INTO TABLE physiological_task_event_hed_rel IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;