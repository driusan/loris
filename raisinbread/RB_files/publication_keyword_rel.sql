SET FOREIGN_KEY_CHECKS=0;
TRUNCATE publication_keyword_rel;
LOAD DATA LOCAL INFILE 'publication_keyword_rel.txt' INTO TABLE publication_keyword_rel IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;