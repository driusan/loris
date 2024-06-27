SET FOREIGN_KEY_CHECKS=0;
TRUNCATE genomic_analysis_modality_enum;
LOAD DATA LOCAL INFILE 'genomic_analysis_modality_enum.txt' INTO TABLE genomic_analysis_modality_enum IGNORE 1 LINES;
SET FOREIGN_KEY_CHECKS=1;