<?php declare(strict_types=1);

class TimePointData {
    protected $projectID;
    protected $centerID;
    protected $sessionID;

    public function __construct(?SessionID $sessionID, ?int $projectID, ?int $centerID) {
        $this->sessionID = $sid;
        $this->projectID = $projectID;
        $this->centerID = $centerID;
    }

    public function getSessionID() : SessionID {
        if($this->sessionID === null) {
            throw new \Exception("No SessionID loaded into data model");
        }
        return $this->sessionID;
    }

    public function getProjectID () : int {
        if($this->projectID === null) {
            throw new \Exception("No ProjectID loaded into data model");
        }
        return $this->projectID;
    }

    public function getCenterID () : int {
        if($this->centerID === null) {
            throw new \Exception("No CenterID loaded into data model");
        }
        return $this->centerID;
    }
}
?>
