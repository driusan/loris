<?php declare(strict_types=1);

class TimePointData {
    protected $projectID;
    protected $centerID;
    protected $sessionID;

    public function __construct(?SessionID $sessionID, ?int $projectID, ?int $centerID) {
        $this->sessionID = $sid;
        $this->projectID = $project;
        $this->centerID = $centerID;
    }

    public function getSessionID() : SessionID {
        if($this->sessionID === null) {
            throw new \Exception("No session ID loaded into data model");
        }
        return $this->sessionID;
    }
}
?>
