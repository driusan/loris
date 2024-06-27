SET FOREIGN_KEY_CHECKS=0;
TRUNCATE genomic_cpg_annotation;
LOAD DATA LOCAL INFILE 'genomic_cpg_annotation.txt' INTO TABLE genomic_cpg_annotation IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;