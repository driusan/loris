<?php
require 'vendor/autoload.php';

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
    protected $participantstatus;
    protected $visitCount;
    protected $feedback;

    public function toJSON() : string {
        // Site, DCCID, PSCID, GEnder, EntityType, ParticipantStatus,
        // Subproject, DoB, ScanDone, VisitCount, LatestVisitStatus,
        // Feedback
        $arr = [
            'Site' => $this->candidate->getSiteName(),
            'CandID' => $this->candidate->getCandID(),
            'PSCID' => $this->candidate->getCandID(),
            'Gender' => $this->candidate->getGender(),
            'EntityType' => $this->candidate->getEntityType(),
            'Participant Status' => $this->participantStatus,
            'Subproject' => $this->candidate->getSubproject(),
            'DoB' => $this->candidate->getDateOfBirth(),
            'Scan Done' => $this->candidate->getScanDone(),
        ];
        return json_encode($arr);
    }
}

class CandidateListRowProvisioner extends \LORIS\Data\Provisioner {
    protected function GetAllRows() : array {
        $sql = "SELECT c.CandID,
                 COALESCE(pso.Description,'Active') as ParticipantStatus,
                 COUNT(DISTINCT s.Visit_label) as VisitCount,
                 IFNULL(MIN(feedback_bvl_thread.Status+0),0) as Feedback,
        FROM candidate c
              LEFT JOIN psc ON (c.CenterID=psc.CenterID)
              LEFT JOIN session s ON (c.CandID = s.CandID AND s.Active = 'Y')
              LEFT JOIN feedback_bvl_thread
                  ON (c.CandID=feedback_bvl_thread.CandID)
              LEFT JOIN participant_status ps ON (ps.CandID=c.CandID)
              LEFT JOIN participant_status_options pso
                  ON (ps.participant_status=pso.ID)
             WHERE c.Active = 'Y'";

        $db = Database::singleton();
        $query = $db->pselect($sql, array());
        $results = [];
        foreach ($query as $row) {
            $r = new CandidadateListRowInstance(
                Candidate::singleton($row['CandID']),
                $row['Participant_Status'],
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
