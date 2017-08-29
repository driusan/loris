<?php 
/**
 * LORIS DTO template
 *
 * Data Transfer Object (DTO).
 * It should be use to encapsulate all site related data and should
 * be used to transfer data between the application layer and the persistance
 * with minimal knowledge of what Session does.
 */
namespace LORIS\Data\Models\TransferObjects;

class Session extends \LORIS\Data\Models\TransferObject
{
    /**
     * This data is directly mapped to the columns of database table.
     */
    private $_ID;
    private $_CandID;
    private $_CenterID;
    private $_VisitNo;
    private $_Visit_label;
    private $_SubprojectID;
    private $_Submitted;
    private $_Current_stage;
    private $_Date_stage_change;
    private $_Screening;
    private $_Date_screening;
    private $_Visit;
    private $_Date_visit;
    private $_Approval;
    private $_Date_approval;
    private $_Active;
    private $_Date_active;
    private $_RegisteredBy;
    private $_UserID;
    private $_Date_registered;
    private $_Testdate;
    private $_Hardcopy_request;
    private $_BVLQCStatus;
    private $_BVLQCType;
    private $_BVLQCExclusion;
    private $_QCd;
    private $_Scan_done;
    private $_MRIQCStatus;
    private $_MRIQCPending;
    private $_MRIQCFirstChangeTime;
    private $_MRIQCLastChangeTime;
    private $_MRICaveat;

    // Getters and Setters
    public function getID() {return $this->_ID;}
    public function setID($ID) {$this->_ID = $ID;}
    public function getCandID() {return $this->_CandID;}
    public function setCandID($CandID) {$this->_CandID = $CandID;}
    public function getCenterID() {return $this->_CenterID;}
    public function setCenterID($CenterID) {$this->_CenterID = $CenterID;}
    public function getVisitNo() {return $this->_VisitNo;}
    public function setVisitNo($VisitNo) {$this->_VisitNo = $VisitNo;}
    public function getVisit_label() {return $this->_Visit_label;}
    public function setVisit_label($Visit_label) {$this->_Visit_label = $Visit_label;}
    public function getSubprojectID() {return $this->_SubprojectID;}
    public function setSubprojectID($SubprojectID) {$this->_SubprojectID = $SubprojectID;}
    public function getSubmitted() {return $this->_Submitted;}
    public function setSubmitted($Submitted) {$this->_Submitted = $Submitted;}
    public function getCurrent_stage() {return $this->_Current_stage;}
    public function setCurrent_stage($Current_stage) {$this->_Current_stage = $Current_stage;}
    public function getDate_stage_change() {return $this->_Date_stage_change;}
    public function setDate_stage_change($Date_stage_change) {$this->_Date_stage_change = $Date_stage_change;}
    public function getScreening() {return $this->_Screening;}
    public function setScreening($Screening) {$this->_Screening = $Screening;}
    public function getDate_screening() {return $this->_Date_screening;}
    public function setDate_screening($Date_screening) {$this->_Date_screening = $Date_screening;}
    public function getVisit() {return $this->_Visit;}
    public function setVisit($Visit) {$this->_Visit = $Visit;}
    public function getDate_visit() {return $this->_Date_visit;}
    public function setDate_visit($Date_visit) {$this->_Date_visit = $Date_visit;}
    public function getApproval() {return $this->_Approval;}
    public function setApproval($Approval) {$this->_Approval = $Approval;}
    public function getDate_approval() {return $this->_Date_approval;}
    public function setDate_approval($Date_approval) {$this->_Date_approval = $Date_approval;}
    public function getActive() {return $this->_Active;}
    public function setActive($Active) {$this->_Active = $Active;}
    public function getDate_active() {return $this->_Date_active;}
    public function setDate_active($Date_active) {$this->_Date_active = $Date_active;}
    public function getRegisteredBy() {return $this->_RegisteredBy;}
    public function setRegisteredBy($RegisteredBy) {$this->_RegisteredBy = $RegisteredBy;}
    public function getUserID() {return $this->_UserID;}
    public function setUserID($UserID) {$this->_UserID = $UserID;}
    public function getDate_registered() {return $this->_Date_registered;}
    public function setDate_registered($Date_registered) {$this->_Date_registered = $Date_registered;}
    public function getTestdate() {return $this->_Testdate;}
    public function setTestdate($Testdate) {$this->_Testdate = $Testdate;}
    public function getHardcopy_request() {return $this->_Hardcopy_request;}
    public function setHardcopy_request($Hardcopy_request) {$this->_Hardcopy_request = $Hardcopy_request;}
    public function getBVLQCStatus() {return $this->_BVLQCStatus;}
    public function setBVLQCStatus($BVLQCStatus) {$this->_BVLQCStatus = $BVLQCStatus;}
    public function getBVLQCType() {return $this->_BVLQCType;}
    public function setBVLQCType($BVLQCType) {$this->_BVLQCType = $BVLQCType;}
    public function getBVLQCExclusion() {return $this->_BVLQCExclusion;}
    public function setBVLQCExclusion($BVLQCExclusion) {$this->_BVLQCExclusion = $BVLQCExclusion;}
    public function getQCd() {return $this->_QCd;}
    public function setQCd($QCd) {$this->_QCd = $QCd;}
    public function getScan_done() {return $this->_Scan_done;}
    public function setScan_done($Scan_done) {$this->_Scan_done = $Scan_done;}
    public function getMRIQCStatus() {return $this->_MRIQCStatus;}
    public function setMRIQCStatus($MRIQCStatus) {$this->_MRIQCStatus = $MRIQCStatus;}
    public function getMRIQCPending() {return $this->_MRIQCPending;}
    public function setMRIQCPending($MRIQCPending) {$this->_MRIQCPending = $MRIQCPending;}
    public function getMRIQCFirstChangeTime() {return $this->_MRIQCFirstChangeTime;}
    public function setMRIQCFirstChangeTime($MRIQCFirstChangeTime) {$this->_MRIQCFirstChangeTime = $MRIQCFirstChangeTime;}
    public function getMRIQCLastChangeTime() {return $this->_MRIQCLastChangeTime;}
    public function setMRIQCLastChangeTime($MRIQCLastChangeTime) {$this->_MRIQCLastChangeTime = $MRIQCLastChangeTime;}
    public function getMRICaveat() {return $this->_MRICaveat;}
    public function setMRICaveat($MRICaveat) {$this->_MRICaveat = $MRICaveat;}

    // Shortcut to avoid the use of setters during instanciation.
    private function _setAll(array &$allVals) {
        $this->_ID = $allVals['ID'];
        $this->_CandID = $allVals['CandID'];
        $this->_CenterID = $allVals['CenterID'];
        $this->_VisitNo = $allVals['VisitNo'];
        $this->_Visit_label = $allVals['Visit_label'];
        $this->_SubprojectID = $allVals['SubprojectID'];
        $this->_Submitted = $allVals['Submitted'];
        $this->_Current_stage = $allVals['Current_stage'];
        $this->_Date_stage_change = $allVals['Date_stage_change'];
        $this->_Screening = $allVals['Screening'];
        $this->_Date_screening = $allVals['Date_screening'];
        $this->_Visit = $allVals['Visit'];
        $this->_Date_visit = $allVals['Date_visit'];
        $this->_Approval = $allVals['Approval'];
        $this->_Date_approval = $allVals['Date_approval'];
        $this->_Active = $allVals['Active'];
        $this->_Date_active = $allVals['Date_active'];
        $this->_RegisteredBy = $allVals['RegisteredBy'];
        $this->_UserID = $allVals['UserID'];
        $this->_Date_registered = $allVals['Date_registered'];
        $this->_Testdate = $allVals['Testdate'];
        $this->_Hardcopy_request = $allVals['Hardcopy_request'];
        $this->_BVLQCStatus = $allVals['BVLQCStatus'];
        $this->_BVLQCType = $allVals['BVLQCType'];
        $this->_BVLQCExclusion = $allVals['BVLQCExclusion'];
        $this->_QCd = $allVals['QCd'];
        $this->_Scan_done = $allVals['Scan_done'];
        $this->_MRIQCStatus = $allVals['MRIQCStatus'];
        $this->_MRIQCPending = $allVals['MRIQCPending'];
        $this->_MRIQCFirstChangeTime = $allVals['MRIQCFirstChangeTime'];
        $this->_MRIQCLastChangeTime = $allVals['MRIQCLastChangeTime'];
        $this->_MRICaveat = $allVals['MRICaveat'];
    }

    /**
     *
     */
    public function getPrimaryKey()
    {
        $keys = array(
            'ID' => $this->_ID,
        );
    }

    /**
     * Constructor
     */
    public function __construct(array &$allVals)
    {
        $this->_setAll($allVals);
    }

    /**
     * The __toString() method allows a class to decide how it will react when it
     * is treated like a string. For example, what echo $obj; will print. This
     * method must return a string, as otherwise a fatal E_RECOVERABLE_ERROR level
     * error is emitted. 
     *
     * @note You cannot throw an exception from within a __toString() method. Doing
     *       so will result in a fatal error. 
     *
     * @return string A string representation of the object.
     */
    public function __toString()
    {
        try {
            return json_encode($this->asArray());
        } catch (Exception $e) {
            trigger_error($e->getMessage(), E_RECOVERABLE_ERROR);
        }
    }

    /**
     * This methods return an array representation of the object. This object
     * properties can be white listed using the model_variables properties.
     *
     * @return array An array representation of the object
     */
    public function asArray()
    {
        // get all object vars
        $vars = $this->model_variables ?? get_object_vars($this);

        // Remove the '_' prefix from the keys
        $new_keys = array_map(function($key) {return ltrim($key, '_'); }, array_keys($vars));

        return array_combine($new_keys, array_values($vars));
    }
}
