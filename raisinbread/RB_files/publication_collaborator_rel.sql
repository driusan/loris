SET FOREIGN_KEY_CHECKS=0;
TRUNCATE publication_collaborator_rel;
LOAD DATA LOCAL INFILE 'publication_collaborator_rel.txt' INTO TABLE publication_collaborator_rel IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;