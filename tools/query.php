<?php
use \LORIS\Data\Query\CandidateQuery;
use \LORIS\Data\Query\EqualCriteria;
use \LORIS\Data\Query\LessThanCriteria;
use \LORIS\Data\Query\LessThanOrEqualCriteria;
/*

I want to get the PSCID of all candidates that are at site SEA with Sex=Male
and ADI_R adi_r_proband IN (2_other_caregiver,3_combination)

Query candidate_parameters for Site=SEA (Get back list of sessions since session scope)
Query candidate_parameters for Sex=Male (Get back list of candidates since candidate scope)
Query instruments for adi_r_proband=2_other_caregiver (Get back list of sessions since session scope)

Data: PSCID

$qe = $candparam->getQueryEngine();

$candparam->getCandidateMatches(
    CandidateQuery[$sitedict, EqCritiera{SEA}, Any],
)
$candparam->getCandidateMatches(
    CandidateQuery[$sexdict, EqCritiera{Male}, Any],
)

$instr->getCandidateMatches(
    CandidateQuery[$adi_r_probandcaregiverdict, EqCritiera{2_other_caregiver}, Any],
)

intersection all

$candparams->getCandidateData([$psciddict], candidatelist);

interface QueryEngine {
    andCandidateMatches(DictionaryItem, Criteria $query, VisitList[])
    orCandidateMatches(DictionaryItem, Criteria $query, VisitList[])
}

interface Criteria {
    __construct($value...)
}
 */

require_once __DIR__ . "/../vendor/autoload.php";
require_once 'generic_includes.php';
$loris= new \LORIS\LorisInstance(
            \NDB_Factory::singleton()->database(),
            \NDB_Factory::singleton()->config(),
            [
             __DIR__ . '/../project/modules',
             __DIR__ . '/modules',
            ]
        );

$cpm = \Module::factory('candidate_parameters');



$dict = $cpm->getDataDictionary($loris);

$criteria = [];
foreach($dict as $cat) {
    foreach($cat->getItems() as $query) {
        /*
        if($query->getName() == 'Site') {
            $criteria[] = new CandidateQuery($query, new EqualCriteria('SEA'));
        }
        if($query->getName() == 'Sex') {
            $criteria[] = new CandidateQuery($query, new EqualCriteria('Male'));
        }
        if($query->getName() == 'Subproject') {
            $criteria[] = new CandidateQuery($query, new EqualCriteria('6 month recruit'));
        }
         */
        /*
        if($query->getName() == 'Project') {
            $criteria[] = new CandidateQuery($query, new EqualCriteria('IBIS1'));
        }

        // 2002-02-01, 672968
        if($query->getName() == 'DoB') {
            $criteria[] = new CandidateQuery($query, new LessThanOrEqualCriteria('2002-02-01'));
        }
 */
 /*       if($query->getName() == 'VisitLabel') {
            $criteria[] = new CandidateQuery($query, new EqualCriteria('V12'));
        }

        if($query->getName() == 'CandID') {
            $criteria[] = new CandidateQuery($query, new EqualCriteria('965327'));
        }
        if($query->getName() == 'CandID') {
            $criteria[] = new CandidateQuery($query, new EqualCriteria('965327'));
        }
        if($query->getName() == 'EntityType') {
            $criteria[] = new CandidateQuery($query, new EqualCriteria('Scanner'));
        }
  */
        if($query->getName() == 'DoD') {
            $criteria[] = new CandidateQuery($query, new EqualCriteria('2020-01-01'));
        }
    }
}

var_dump($cpm->getCandidateMatches($criteria, null));
//var_dump($cpm->getCandidateMatches($criteria, ['V12']));
