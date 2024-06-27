SET FOREIGN_KEY_CHECKS=0;
TRUNCATE physiological_task_event;
LOAD DATA LOCAL INFILE 'physiological_task_event.txt' INTO TABLE physiological_task_event IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;