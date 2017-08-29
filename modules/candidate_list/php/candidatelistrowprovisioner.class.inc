<?php

namespace LORIS\candidate_list;

use \LORIS\Data\Models\AccessObjects;

class CandidateListRowProvisioner extends \LORIS\Data\Provisioner {
    protected function GetAllRows() : array {
        $candidate_dao = new AccessObjects\Candidate();
        $site_dao      = new AccessObjects\Site();
        $session_dao   = new AccessObjects\Session();

        return array_map(function($c) use ($site_dao, $session_dao) {
            $site   = $site_dao->getOne(array('CenterID' => $c->getCenterID()));

            $sessions = $session_dao->getAllByCandidate($c->getCandID()); 

            $hasScanDone = array_reduce($sessions, function ($carry, $item) {
                return $carry || $item->getScan_done() == 'Y';
            }, false);

            $latestVisitStatus = '';
            $chrono_cmp = function ($v1, $v2) {
                return strcmp($v1->getDate_visit(), $v2->getDate_visit());
            };
            usort($sessions, $chrono_cmp);
            $latestVisit       = end($sessions);
            if (!empty($latestVisit)) {
                $latestVisitStatus = $latestVisit->getCurrent_stage();
            } 

            $row = array(
                "Site"                => $site->getName(),
                "DCCID"               => $c->getCandId(),
                "PSCID"               => $c->getPscid(),
                "Gender"              => $c->getGender(),
                "Entity Type"         => $c->getEntity_Type(),
                "Participant Status"  => 'Active', // TODO 
                "Subproject"          => 'High, Low', // TODO
                "DoB"                 => $c->getDob(),
                "Scan Done"           => $hasScanDone ? 'Y' : 'N',
                "Visit Count"         => count($sessions),
                "Latest Visit Status" => $latestVisitStatus,
                "Feedback"            => 'Yeah!'
            );
            return new CandidateListRow($row, $c->getCenterID());
        }, $candidate_dao->getAll());
    }
}
