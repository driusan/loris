SET FOREIGN_KEY_CHECKS=0;
TRUNCATE document_repository_categories;
LOAD DATA LOCAL INFILE 'document_repository_categories.txt' INTO TABLE document_repository_categories IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;