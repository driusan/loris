<?php

namespace LORIS\candidate_list;

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
        $db = \Database::singleton();
        $query = $db->pselect($sql, array());
        $results = [];

        foreach ($query as $row) {
            $cid = $row['CenterID'];
            unset($row['CenterID']);
            $r = new CandidateListRow($row, $cid);
            $results[] = $r;
        }
       return $results; 
    }
}
