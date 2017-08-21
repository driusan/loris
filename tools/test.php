<?php
require '../vendor/autoload.php';
require 'generic_includes.php';

class CandidateList extends \NDB_Page {
    private $table; // TableD
    public function __construct() {
        // Provisioner should filter by CenterID
        $provisioner = (new CandidateListRowProvisioner())
            ->Filter(new \LORIS\Data\Filters\SiteMatch());

        $this->table = (new \LORIS\Data\Table())
            ->WithDataFrom($provisioner);
    }

    public function toJSON() {
        return $this->table->toJSON(User::singleton());
    }
};

class CandidateListRow implements \LORIS\Data\Instance {
    protected $candidate;
    protected $participantStatus;
    protected $visitCount;
    protected $feedback;

    public function __construct($candidate, $participantstatus, $visitCount, $feedback) {
        $this->candidate         = $candidate;
        $this->participantStatus = $participantstatus;
        $this->visitCount        = $visitCount;
        $this->feedback          = $feedback;
    }

    public function toJSON() : string {
        // Site, DCCID, PSCID, GEnder, EntityType, ParticipantStatus,
        // Subproject, DoB, ScanDone, VisitCount, LatestVisitStatus,
        // Feedback
        print "??\n";
        print_r($this->candidate);
        print "??\n";
        $arr = [
            'Site' => $this->candidate->getCandidateSite(),
            'CandID' => $this->candidate->getCandID(),
            'PSCID' => $this->candidate->getPSCID(),
            'Gender' => $this->candidate->getCandidateGender(),
            'EntityType' => $this->candidate->getData('EntityType'),
            'Participant Status' => $this->participantStatus,
           // 'Subproject' => $this->candidate->getSubproject(),
            'DoB' => $this->candidate->getCandidateDoB(),
            //'Scan Done' => $this->candidate->getScanDone(),
        ];
        return json_encode($arr);
    }

    public function getCenterID() : string {
        return $this->candidate->getCenterID();
    }
}

class CandidateListRowProvisioner extends \LORIS\Data\Provisioner {
    protected function GetAllRows() : array {
        $sql = "SELECT c.CandID,
                 COALESCE(pso.Description,'Active') as ParticipantStatus,
                 COUNT(DISTINCT s.Visit_label) as VisitCount,
                 IFNULL(MIN(feedback_bvl_thread.Status+0),0) as Feedback
        FROM candidate c
              LEFT JOIN psc ON (c.CenterID=psc.CenterID)
              LEFT JOIN session s ON (c.CandID = s.CandID AND s.Active = 'Y')
              LEFT JOIN feedback_bvl_thread
                  ON (c.CandID=feedback_bvl_thread.CandID)
              LEFT JOIN participant_status ps ON (ps.CandID=c.CandID)
              LEFT JOIN participant_status_options pso
                  ON (ps.participant_status=pso.ID)
             WHERE c.Active = 'Y' 
             GROUP BY c.CandID";

        $db = Database::singleton();
        $query = $db->pselect($sql, array());
        $results = [];
        foreach ($query as $row) {
            $r = new CandidateListRow(
                Candidate::singleton($row['CandID']),
                $row['ParticipantStatus'],
                $row['VisitCount'], 
                $row['Feedback']
            );
            $results[] = $r;
        }
       return $results; 
    }
}

$foo = new CandidateList();
print $foo->toJSON();
