ALTER TABLE flag ADD COLUMN TestID integer unsigned REFERENCES test_names(ID) after Test_name;
UPDATE flag SET TestID=(SELECT ID from test_names WHERE test_names.Test_name=flag.Test_name);
ALTER TABLE flag MODIFY TestID integer unsigned NOT NULL;
