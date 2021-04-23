<?php declare(strict_types=1);

class CandidateData {
    protected ProjectID $registrationProjectID;
    protected $registrationCenterID;
    protected $timepoints;

    public function __construct(\ProjectID $project, ?int $centerID, ?array $timepoints) {
        $this->registrationProjectID = $project;
        $this->registrationCenterID = $centerID;
        $this->timepoints = $timepoints;
    }

    public function getCenterID() : int {
        if ($this->registrationCenterID === null) {
            throw new LogicException("CenterID not loaded in data");
        }
        return $this->registrationCenterID;
    }

    public function getProjectID() : \ProjectID {
        if ($this->registrationProjectID === null) {
            throw new LogicException("ProjectID not loaded in data");
        }
        return $this->registrationProjectID;
    }

    public function getTimepoints() : array {
        if($this->timepoints === null) {
            throw new LogicException("Timepoints not instantiated");
        }
        return $this->timepoints;
    }
}
?>
