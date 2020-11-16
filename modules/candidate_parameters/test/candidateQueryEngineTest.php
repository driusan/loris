<?php

use PHPUnit\Framework\TestCase;

use LORIS\StudyEntities\Candidate\CandID;
use LORIS\Data\Query\QueryTerm;

use LORIS\Data\Query\Criteria\Equal;
use LORIS\Data\Query\Criteria\NotEqual;
use LORIS\Data\Query\Criteria\In;

use LORIS\Data\Query\Criteria\GreaterThanOrEqual;
use LORIS\Data\Query\Criteria\GreaterThan;
use LORIS\Data\Query\Criteria\LessThanOrEqual;
use LORIS\Data\Query\Criteria\LessThan;

use LORIS\Data\Query\Criteria\IsNull;
use LORIS\Data\Query\Criteria\NotNull;

use LORIS\Data\Query\Criteria\StartsWith;
use LORIS\Data\Query\Criteria\EndsWith;
use LORIS\Data\Query\Criteria\Substring;
class CandidateQueryEngineTest
    extends TestCase
{

    protected $engine;

    function setUp() {
        $this->factory = NDB_Factory::singleton();
        $this->factory->reset();
        $this->factory->setTesting(false);

        $this->config = $this->factory->Config("../project/config.xml");

        $database = $this->config->getSetting('database');

        $this->DB  = Database::singleton(
            $database['database'],
            $database['username'],
            $database['password'],
            $database['host'],
            1
        );

        $this->DB = $this->factory->database();

        $this->DB->setFakeTableData("candidate",
            [
                [
                    'ID' => 1,
                    'CandID' => "123456",
                    'PSCID' => "test1",
                    'RegistrationProjectID' => '1',
                    'RegistrationCenterID' => '1',
                    'Active' => 'Y',
                    'DoB' => '1920-01-30',
                    'DoD' => '1950-11-16',
                    'Sex' => 'Male',
                    'EDC' => null,
                    'Entity_type' => 'Human',
                ],
                [
                    'ID' => 2,
                    'CandID' => "123457",
                    'PSCID' => "test2",
                    'RegistrationProjectID' => '1',
                    'RegistrationCenterID' => '2',
                    'Active' => 'Y',
                    'DoB' => '1930-05-03',
                    'DoD' => null,
                    'Sex' => 'Female',
                    'EDC' => '1930-04-01',
                    'Entity_type' => 'Human',
                ],
                [
                    'ID' => 3,
                    'CandID' => "123458",
                    'PSCID' => "test3",
                    'RegistrationProjectID' => '1',
                    'RegistrationCenterID' => '3',
                    'Active' => 'N',
                    'DoB' => '1940-01-01',
                    'Sex' => 'Other',
                    'EDC' => '1930-04-01',
                    'Entity_type' => 'Human',
                ],
            ]
        );

        $lorisinstance = new \LORIS\LorisInstance($this->DB, $this->config, []);

        $this->engine = \Module::factoryWithInstance('candidate_parameters', $lorisinstance)->getQueryEngine($lorisinstance);
    }

    function tearDown() {
        $this->DB->run("DROP TEMPORARY TABLE IF EXISTS candidate");
    }

    public function testCandIDMatches() {
        $candiddict = $this->getDictItem("CandID");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("123456")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        // 123456 is equal, and 123458 is Active='N', so we should only get 123457
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("123456")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));


        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("123457")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("123457", "123456")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));


        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new GreaterThanOrEqual("123456")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new GreaterThan("123456")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new LessThanOrEqual("123457")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new LessThan("123457")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(0, count($result));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new StartsWith("1")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new StartsWith("2")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(0, count($result));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new StartsWith("123456")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new EndsWith("6")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        // 123458 is inactive
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new EndsWith("8")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(0, count($result));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Substring("5")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));
    }

    public function testPSCIDMatches() {
        // Since it's an SQLQueryEngine we're comfortable with the operators being tested in
        // getCandID and only do a couple for PSCID
        $candiddict = $this->getDictItem("PSCID");
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("test1")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("test1")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("test1")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new StartsWith("te")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new EndsWith("t2")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Substring("es")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(0, count($result));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));

        // No LessThan/GreaterThan/etc since PSCID is a string
    }

    public function testDoBMatches() {
        // Since it's an SQLQueryEngine we're comfortable with the operators being tested in
        // getCandID and only do a couple for PSCID
        $candiddict = $this->getDictItem("DoB");
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("1920-01-30")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("1920-01-30")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("1920-01-30")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(0, count($result));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new LessThanOrEqual("1930-05-03")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new LessThan("1930-05-03")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new GreaterThan("1920-01-30")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new GreaterThanOrEqual("1920-01-30")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));

        // No starts/ends/substring because it's a date
    }

    public function testDoDMatches() {
        // Since it's an SQLQueryEngine we're comfortable with the operators being tested in
        // getCandID and only do a couple for PSCID
        $candiddict = $this->getDictItem("DoD");
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("1950-11-16")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        // XXX: Is this what users expect? It's what SQL logic is, but it's not clear that a
        // user would expect of the DQT when a field is not equal compared to null
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("1950-11-16")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(0, count($result));
        // $this->assertEquals(1, count($result));
        // $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("1950-11-16")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new LessThanOrEqual("1951-05-01")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new LessThan("1951-05-03")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new GreaterThan("1950-01-01")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new GreaterThanOrEqual("1950-01-01")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        // No starts/ends/substring because it's a date
    }

    public function testSexMatches() {
        // Since it's an SQLQueryEngine we're comfortable with the operators being tested in
        // getCandID and only do a couple for PSCID
        $candiddict = $this->getDictItem("Sex");
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("Male")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("Male")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("Female")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(0, count($result));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new StartsWith("Fe")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new EndsWith("male")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Substring("fem")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));
        // No <, <=, >, >= because it's an enum.
    }

    public function testEDCMatches() {
        // Since it's an SQLQueryEngine we're comfortable with the operators being tested in
        // getCandID and only do a couple for PSCID
        $candiddict = $this->getDictItem("EDC");
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("1930-04-01")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        // XXX: It's not clear that this is what a user would expect from != when
        // a value is null. It's SQL logic.
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("1930-04-01")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(0, count($result));
        //$this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("1930-04-01")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new LessThanOrEqual("1930-04-01")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new LessThan("1930-04-01")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(0, count($result));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new GreaterThan("1930-03-01")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new GreaterThanOrEqual("1930-04-01")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));
        // StartsWith/EndsWith/Substring not value since it's a date.
    }

    public function testRegistrationProjectMatches() {
        // Both candidates only have registrationProjectID 1, but we can
        // be pretty comfortable with the comparison operators working in
        // general because of the other field tests, so we just make sure
        // that the project is set up and do basic tests
        $this->DB->setFakeTableData(
            "project",
            [
                [
                    'ProjectID' => 1,
                    'Name' => 'TestProject',
                    'Alias' => 'TST',
                    'recruitmentTarget' => 3
                ]
            ]
        );

        $candiddict = $this->getDictItem("RegistrationProject");
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("TestProject")));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("TestProject")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(0, count($result));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("TestProject2")));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("TestProject")));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(0, count($result));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new StartsWith("TestP")));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new EndsWith("ject")));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Substring("stProj")));
        $this->assertMatchAll($result);

        // <=, <, >=, > are meaningless since it's a string
        $this->DB->run("DROP TEMPORARY TABLE IF EXISTS project");
    }

    public function testRegistrationSiteMatches() {
        // Both candidates only have registrationProjectID 1, but we can
        // be pretty comfortable with the comparison operators working in
        // general because of the other field tests, so we just make sure
        // that the project is set up and do basic tests
        $this->DB->setFakeTableData(
            "psc",
            [
                [
                    'CenterID' => 1,
                    'Name' => 'TestSite',
                    'Alias' => 'TST',
                    'MRI_alias' => 'TSTO',
                    'Study_site' => 'Y',
                ],
                [
                    'CenterID' => 2,
                    'Name' => 'Test Site 2',
                    'Alias' => 'T2',
                    'MRI_alias' => 'TSTY',
                    'Study_site' => 'N',
                ]
            ]
        );

        $candiddict = $this->getDictItem("RegistrationSite");
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("TestSite")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123456"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("TestSite")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("TestSite", "Test Site 2")));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertTrue(is_array($result));
        $this->assertEquals(0, count($result));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new StartsWith("Test")));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new EndsWith("2")));
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID("123457"));

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Substring("Site")));
        $this->assertMatchAll($result);

        // <=, <, >=, > are meaningless since it's a string
        $this->DB->run("DROP TEMPORARY TABLE IF EXISTS psc");
    }

    public function testEntityType() {
        // Since it's an SQLQueryEngine we're comfortable with the operators being tested in
        // getCandID and only do a couple for PSCID
        $candiddict = $this->getDictItem("EntityType");
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("Human")));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("Human")));
        $this->assertMatchNone($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("Scanner")));
        $this->assertMatchNone($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertMatchNone($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new StartsWith("Hu")));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new EndsWith("an")));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Substring("um")));
        $this->assertMatchAll($result);
        // No <, <=, >, >= because it's an enum.
    }

    function testVisitLabelMatches() {
        // 123456 has multiple visits, 123457 has none. Operators are implicitly
        // "for at least 1 session".
        $this->DB->setFakeTableData("session",
            [
                [
                    'ID' => 1,
                    'CandID' => "123456",
                    'CenterID' => '1',
                    'ProjectID' => '1',
                    'Active' => 'Y',
                    'Visit_label' => 'V1',
                ],
                [
                    'ID' => 2,
                    'CandID' => "123456",
                    'CenterID' => '2',
                    'ProjectID' => '1',
                    'Active' => 'Y',
                    'Visit_label' => 'V2',
                ],
            ]
        );


        $candiddict = $this->getDictItem("VisitLabel");
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("V1")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("V1")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("V3")));
        $this->assertMatchNone($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertMatchNone($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new StartsWith("V")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new EndsWith("1")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Substring("V")));
        $this->assertMatchOne($result, "123456");

        // <, <=, >, >= not valid because visit label is a string
        $this->DB->run("DROP TEMPORARY TABLE IF EXISTS session");
    }

    function testProjectMatches() {
        // 123456 has multiple visits, 123457 has none. Operators are implicitly
        // "for at least 1 session".
        // The ProjectID for the session doesn't match the RegistrationProjectID
        // for, so we need to ensure that the criteria is being compared based
        // on the session's, not the registration.
        $this->DB->setFakeTableData("session",
            [
                [
                    'ID' => 1,
                    'CandID' => "123456",
                    'CenterID' => '1',
                    'ProjectID' => '2',
                    'Active' => 'Y',
                    'Visit_label' => 'V1',
                ],
                [
                    'ID' => 2,
                    'CandID' => "123456",
                    'CenterID' => '2',
                    'ProjectID' => '2',
                    'Active' => 'Y',
                    'Visit_label' => 'V2',
                ],
            ]
        );

        $this->DB->setFakeTableData(
            "project",
            [
                [
                    'ProjectID' => 1,
                    'Name' => 'TestProject',
                    'Alias' => 'TST',
                    'recruitmentTarget' => 3
                ],
                [
                    'ProjectID' => 2,
                    'Name' => 'TestProject2',
                    'Alias' => 'T2',
                    'recruitmentTarget' => 3
                ]
            ]
        );

        $candiddict = $this->getDictItem("Project");
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("TestProject")));
        $this->assertMatchNone($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("TestProject")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("TestProject2")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertMatchNone($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new StartsWith("Test")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new EndsWith("2")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Substring("Pr")));
        $this->assertMatchOne($result, "123456");

        // <, <=, >, >= not valid because visit label is a string
        $this->DB->run("DROP TEMPORARY TABLE IF EXISTS session");
        $this->DB->run("DROP TEMPORARY TABLE IF EXISTS project");
    }

    function testSiteMatches() {
        // 123456 has multiple visits at different centers, 123457 has none.
        // Operators are implicitly "for at least 1 session" so only 123456
        // should ever match.
        $this->DB->setFakeTableData("session",
            [
                [
                    'ID' => 1,
                    'CandID' => "123456",
                    'CenterID' => '1',
                    'ProjectID' => '2',
                    'Active' => 'Y',
                    'Visit_label' => 'V1',
                ],
                [
                    'ID' => 2,
                    'CandID' => "123456",
                    'CenterID' => '2',
                    'ProjectID' => '2',
                    'Active' => 'Y',
                    'Visit_label' => 'V2',
                ],
            ]
        );

        $this->DB->setFakeTableData(
            "psc",
            [
                [
                    'CenterID' => 1,
                    'Name' => 'TestSite',
                    'Alias' => 'TST',
                    'MRI_alias' => 'TSTO',
                    'Study_site' => 'Y',
                ],
                [
                    'CenterID' => 2,
                    'Name' => 'Test Site 2',
                    'Alias' => 'T2',
                    'MRI_alias' => 'TSTY',
                    'Study_site' => 'N',
                ]
            ]
        );

        $candiddict = $this->getDictItem("Site");
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("TestSite")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("TestSite")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("TestSite")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertMatchNone($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new StartsWith("Test")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new EndsWith("2")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Substring("ite")));
        $this->assertMatchOne($result, "123456");

        // <, <=, >, >= not valid because visit label is a string
        $this->DB->run("DROP TEMPORARY TABLE IF EXISTS session");
        $this->DB->run("DROP TEMPORARY TABLE IF EXISTS psc");
    }

    function testSubprojectMatches() {
        // 123456 and 123457 have 1 visit each, different subprojects
        $this->DB->setFakeTableData("session",
            [
                [
                    'ID' => 1,
                    'CandID' => "123456",
                    'CenterID' => '1',
                    'ProjectID' => '2',
                    'SubprojectID' => '1',
                    'Active' => 'Y',
                    'Visit_label' => 'V1',
                ],
                [
                    'ID' => 2,
                    'CandID' => "123457",
                    'CenterID' => '2',
                    'ProjectID' => '2',
                    'SubprojectID' => '2',
                    'Active' => 'Y',
                    'Visit_label' => 'V2',
                ],
            ]
        );

        $this->DB->setFakeTableData(
            "subproject",
            [
                [
                    'SubprojectID' => 1,
                    'title' => 'Subproject1',
                    'useEDC' => '0',
                    'Windowdifference' => 'battery',
                    'RecruitmentTarget' => 3,
                ],
                [
                    'SubprojectID' => 2,
                    'title' => 'Battery 2',
                    'useEDC' => '0',
                    'Windowdifference' => 'battery',
                    'RecruitmentTarget' => 3,
                ],
            ]
        );

        $candiddict = $this->getDictItem("Subproject");
        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("Subproject1")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("Subproject1")));
        $this->assertMatchOne($result, "123457");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("Subproject1")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertMatchNone($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new StartsWith("Sub")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new EndsWith("1")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Substring("proj")));
        $this->assertMatchOne($result, "123456");

        // <, <=, >, >= not valid because visit label is a string
        $this->DB->run("DROP TEMPORARY TABLE IF EXISTS session");
        $this->DB->run("DROP TEMPORARY TABLE IF EXISTS subproject");
    }

    function testParticipantStatusMatches() {
        $candiddict = $this->getDictItem("ParticipantStatus");
        $this->DB->setFakeTableData("participant_status_options",
            [
                [
                    'ID' => 1,
                    'Description' => "Withdrawn",
                ],
                [
                    'ID' => 2,
                    'Description' => "Active",
                ],
            ]
        );
        $this->DB->setFakeTableData("participant_status",
            [
                [
                    'ID' => 1,
                    'CandID' => "123457",
                    'participant_status' => '1',
                ],
                [
                    'ID' => 2,
                    'CandID' => "123456",
                    'participant_status' => '2',
                ],
            ]
        );

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Equal("Withdrawn")));
        $this->assertMatchOne($result, "123457");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotEqual("Withdrawn")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new In("Withdrawn", "Active")));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new IsNull()));
        $this->assertMatchNone($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new NotNull()));
        $this->assertMatchAll($result);

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new StartsWith("With")));
        $this->assertMatchOne($result, "123457");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new EndsWith("ive")));
        $this->assertMatchOne($result, "123456");

        $result = $this->engine->getCandidateMatches(new QueryTerm($candiddict, new Substring("ct")));
        $this->assertMatchOne($result, "123456");

        // <, <=, >, >= not valid on participant status
        $this->DB->run("DROP TEMPORARY TABLE IF EXISTS participant_status");
        $this->DB->run("DROP TEMPORARY TABLE IF EXISTS participant_status_options");
    }


    // Other: ParticipantStatus
    private function assertMatchNone($result) {
        $this->assertTrue(is_array($result));
        $this->assertEquals(0, count($result));
    }

    private function assertMatchOne($result, $candid) {
        $this->assertTrue(is_array($result));
        $this->assertEquals(1, count($result));
        $this->assertEquals($result[0], new CandID($candid));
    }
    private function assertMatchAll($result) {
        $this->assertTrue(is_array($result));
        $this->assertEquals(2, count($result));
        $this->assertEquals($result[0], new CandID("123456"));
        $this->assertEquals($result[1], new CandID("123457"));
    }
    
    private function getDictItem(string $name) {
        $categories = $this->engine->getDataDictionary();
        foreach($categories as $category) {
            $items = $category->getItems();
            foreach($items as $item) {
                if($item->getName() == $name) {
                    return $item;
                }
            }
        }
        throw new \Exception("Could not get dictionary item");
    }
}

