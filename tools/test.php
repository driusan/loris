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
        //$d = $this->table->toArray(User::factory("jtibbits@smith.edu"));
        $d = $this->table->toArray(User::singleton());
        return json_encode([
            'Headers' => [
                'Site', 'DCCID', 'PSCID', 'Gender', 'Entity Type', 'Participant Status',
                'Subproject', 'DoB', 'Scan Done', 'Visit Count', 'Latest Visit Status', 'Feedback'],
                'Data' => array_map(function($row) {
                       return array_values($row);
                }, $d),
        ]);
    }
};

class CandidateListRow extends \LORIS\Data\Instance {
    protected $DBRow;
    protected $CenterID;

    public function __construct(array $row, $cid) {
        $this->DBRow = $row;
        $this->CenterID = $cid;
    }

    public function ToArray() : array {
        return $this->DBRow;
    }

    public function getCenterID() {
        return $this->CenterID;
    }
}

class CandidateListRowProvisioner extends \LORIS\Data\Provisioner {
    protected function GetAllRows() : array {
        $sql = "SELECT psc.Name AS Site,
            c.CenterID,
            c.CandID,
            c.PSCID,
            c.Gender,
            c.Entity_type as `Entity Type`,
            COALESCE(pso.Description,'Active') as `Participant Status`,
            GROUP_CONCAT(DISTINCT sp.title) as Subproject,
            DATE_FORMAT(c.DoB,'%Y-%m-%d') AS DoB,
            MAX(s.Scan_done) as `Scan Done`,
            COUNT(DISTINCT s.Visit_label) as `Visit Count`,
            MAX(s.Current_stage) as `Latest Visit Status`,
            IFNULL(MIN(feedback_bvl_thread.Status+0),0) as Feedback
        FROM candidate c
              LEFT JOIN psc ON (c.CenterID=psc.CenterID)
              LEFT JOIN session s ON (c.CandID = s.CandID AND s.Active = 'Y')
              LEFT JOIN feedback_bvl_thread
                  ON (c.CandID=feedback_bvl_thread.CandID)
              LEFT JOIN participant_status ps ON (ps.CandID=c.CandID)
              LEFT JOIN participant_status_options pso
                  ON (ps.participant_status=pso.ID)
              LEFT JOIN subproject sp ON (s.SubprojectID=sp.SubprojectID)
             WHERE c.Active = 'Y' 
             GROUP BY c.CandID";
        $db = Database::singleton();
        $query = $db->pselect($sql, array());
        $results = [];

        foreach ($query as $row) {
            $cid = $row['CenterID'];
            unset($row['CenterID']);
            $r = new CandidateListRow($row, $cid);
            /*
                $

                // Candidate::singleton($row['CandID']),
                Candidate::singleton(942415),
                $row['ParticipantStatus'],
                $row['VisitCount'], 
                $row['Feedback']
            );
             */
            $results[] = $r;
            
        }
       return $results; 
    }
}

$foo = new CandidateList();
print $foo->toJSON();
