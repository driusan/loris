SET FOREIGN_KEY_CHECKS=0;
TRUNCATE publication_collaborator;
LOAD DATA LOCAL INFILE 'publication_collaborator.txt' INTO TABLE publication_collaborator IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;