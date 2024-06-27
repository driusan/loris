SET FOREIGN_KEY_CHECKS=0;
TRUNCATE publication_keyword;
LOAD DATA LOCAL INFILE 'publication_keyword.txt' INTO TABLE publication_keyword IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;