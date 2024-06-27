SET FOREIGN_KEY_CHECKS=0;
TRUNCATE document_repository;
LOAD DATA LOCAL INFILE 'document_repository.txt' INTO TABLE document_repository IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;