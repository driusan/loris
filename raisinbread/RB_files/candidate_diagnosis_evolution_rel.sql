SET FOREIGN_KEY_CHECKS=0;
TRUNCATE candidate_diagnosis_evolution_rel;
LOAD DATA LOCAL INFILE 'candidate_diagnosis_evolution_rel.txt' INTO TABLE candidate_diagnosis_evolution_rel IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;