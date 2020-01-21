<?php
/**
 * The candidate_profile menu
 *
 * PHP Version 5
 *
 * @category Main
 * @package  Candidate_Profile
 * @author   Zaliqa Rosli <zaliqa.rosli@mcin.ca>
 * @license  Loris license
 * @link     https://www.github.com/aces/Loris/
 */
namespace LORIS\candidate_profile;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;
use \Psr\Http\Server\RequestHandlerInterface;
use \LORIS\StudyEntities\Candidate\CandID;

/**
 * The candidate_profile menu
 *
 * PHP Version 5
 *
 * @category Main
 * @package  Candidate_Profile
 * @author   Zaliqa Rosli <zaliqa.rosli@mcin.ca>
 * @license  Loris license
 * @link     https://www.github.com/aces/Loris/
 */
class Candidate_Profile extends \NDB_Page
{
    public $skipTemplate = true;

    protected $jsonData;
    protected $candID;
    protected $pscid;

    /**
     * Overloading this method to allow access to candidate_profile
     *
     * @param \User $user The user whose access is being checked
     *
     * @return bool
     */
    function _hasAccess(\User $user) : bool
    {
        $candidate = \Candidate::singleton($this->candID);

        // check user permissions
        if ($user->hasPermission('access_all_profiles')
            || (in_array(
                $candidate->getData('RegistrationCenterID'),
                $user->getData('CenterIDs')
            ))
        ) {
            return true;
        }

        // if the candidate.RegistrationCenterID does not match the users.CenterID
        // then check if any of the timepoints belong to the user's site
        $listOfTimePoints = $candidate->getListOfTimePoints();

        foreach ($listOfTimePoints as $sessionID) {
            // create timepoint object
            $timePoint =& \TimePoint::singleton($sessionID);
            // check if at least one timepoint belongs to the user's site
            if (in_array(
                $timePoint->getData('CenterID'),
                $user->getData('CenterIDs')
            )
            ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Handle an incoming HTTP request. The candidate_profile overrides the default
     * handler to populate the CandID field for the page class.
     *
     * @param ServerRequestInterface  $request The incoming PSR7 request
     * @param RequestHandlerInterface $handler The PSR15 handler.
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ) : ResponseInterface {
        // FIXME: Update the code to add the singleton here, not the identifier.
       $this->candID = (new CandID($request->getAttribute('CandID')))->__toString();
        return parent::process($request, $handler);
    }

    /**
     * Setup function
     *
     * @return void
     */
    function setup()
    {
        // Create candidate object
        $candidate =& \Candidate::singleton($this->candID);
        $DB        =& \Database::singleton();
        $user      =& \User::singleton();

        $this->pscid      = $candidate->getPSCID();
        $listOfTimePoints = $candidate->getListOfTimePoints();

        // Get timepoint data
        if (!empty($listOfTimePoints)) {
            $username = $user->getData('UserID');
            $feedback_select_inactive = null;
            if ($user->hasPermission('bvl_feedback')) {
                $feedback_select_inactive = 'Y';
            }
            // List of visits
            $x              = 0;
            $numberOfVisits = 0;
            $timePoints     = array();
            foreach ($listOfTimePoints as $currentTimePoint) {
                $timePoint =& \TimePoint::singleton($currentTimePoint);
                // get the first date of visit in order to
                // turn on the future time points bit if we have a date of visit
                $dateOfVisit = $timePoint->getDateOfVisit();
                if (!empty($dateOfVisit)) {
                    if (empty($firstDateOfVisit)) {
                        $firstDateOfVisit = $dateOfVisit;
                    }
                    $numberOfVisits++;
                }
                // get timepoint data
                $timePoints[$x] = $timePoint->getData();

                // get current status
                $timePoints[$x]['currentStatus']
                    = $timePoint->getCurrentStatus();
                // get current date
                $timePoints[$x]['currentDate']
                    = $timePoint->getCurrentDate();

                // create feedback object for the time point
                $feedback = \NDB_BVL_Feedback::singleton(
                    $username,
                    null,
                    $timePoint->getData('SessionID')
                );

                $feedback_status = $feedback->getMaxThreadStatus(
                    $feedback_select_inactive
                );

                $feedback_count = $feedback->getThreadCount();

                $timePoints[$x]['feedbackCount']
                    = (empty($feedback_count))
                       ? $feedback_status
                       : $feedback_count;

                $timePoints[$x]['feedbackStatus']
                    = $feedback_status;

                $timePoints[$x]['feedbackColor']
                    = $feedback->getThreadColor($feedback_status);

                if (!in_array(
                    $timePoint->getCurrentStage(),
                    array(
                        null,
                        'Not Started',
                        'Visit',
                        'Screening',
                    )
                )
                ) {
                    // for static stages, don't bother showing current status
                    $timePoints[$x]['staticStage'] = true;

                    // get the outcome data
                    $outcomeStage
                        = $this->_determinePreviousStage($currentTimePoint);

                    $getStatusMethod
                        = 'get'.$outcomeStage.'Status';

                    $getDateMethod = 'getDateOf'.$outcomeStage;

                    // set the template data
                    $this->timePoints[$x]['outcomeStage']
                        = $outcomeStage;

                    if (method_exists($timePoint, $getStatusMethod)) {
                          $timePoints[$x]['outcomeStatus']
                              = $timePoint->$getStatusMethod();
                    }
                    if (method_exists($timePoint, $getDateMethod)) {
                        $timePoints[$x]['outcomeDate']
                            = $timePoint->$getDateMethod();
                    }
                }
                $x++;
            }
            // List of future visits
            if (isset($firstDateOfVisit)) {
                $timePoint    = \TimePoint::singleton($listOfTimePoints[0]);
                $subprojectID = $timePoint->getSubprojectID();
            }
        }
        $cand_CenterID     = $candidate->getData('RegistrationCenterID');
        $isDataEntryPerson = $user->hasCenterPermission("data_entry", $cand_CenterID);

        // Get participant status
        $query = "SELECT pso.Description AS participant_status
                      FROM participant_status ps
                      LEFT JOIN participant_status_options pso
                      ON (ps.participant_status=pso.ID) WHERE CandID=:candid";
        $row   = $DB->pselectRow($query, ['candid' => $this->candID]);
        $participant_status = !empty($row['participant_status']) ? $row['participant_status']
        : '-';

        // Get consent data
        $listOfConsents = \Utility::getConsentList();
        $consentData    = $candidate->getConsents();
        $consent        = array();

        foreach ($listOfConsents as $consentID => $consentDetail) {
            $consent[$consentID]['Label']  = $consentDetail['Label'];
            if (empty($consentData[$consentID])) {
                $consent[$consentID]['Status'] = null;
                $consent[$consentID]['Date']   = null;
            } else {
                $consent[$consentID]['Status'] = $consentData[$consentID]['Status'];
                $consent[$consentID]['DateGiven']   = $consentData[$consentID]['DateGiven'];
            }
        }

        // Get imaging data
        $imaging_count = "SELECT COUNT(*) FROM files WHERE SessionID IN
            (SELECT ID FROM session WHERE CandID=:candid)";
        $numberOfMincs = $DB->pselectOne($imaging_count, array('candid' => $this->candID));

        $upload_query = "SELECT UploadID, UploadDate FROM mri_upload WHERE SessionID IN
            (SELECT ID FROM session WHERE CandID=:candid) ORDER BY UploadDate DESC LIMIT 1";
        $lastInserted = $DB->pselect($upload_query, array('candid' => $this->candID));

        $uploadID    = $lastInserted[0]['UploadID'];
        $file_query  = "SELECT FileID FROM files WHERE SessionID=(SELECT SessionID FROM
            mri_upload WHERE UploadID=:uploadid) ORDER BY FileID DESC LIMIT 2";
        $file_result = $DB->pselect($file_query, array('uploadid' => $uploadID));

        $picArr = array();
        if (!empty($file_result)) {
            foreach ($file_result as $key => $result) {
              $fileID      = $result['FileID'];
              // Get imaging thumbnail pic
              if ($fileID) {
                  $mriFileObj       = new \MRIFile($fileID);
                  $checkPicFilename = $mriFileObj->getParameter(
                      'check_pic_filename'
                  ) ?? '';
                  $checkPic         = "/mri/jiv/get_file.php?file=pic/". $checkPicFilename;
                  $picArr[]         = $checkPic ?? null;
              }
            }
        }
        $imagingData = array(
            'numberOfMincs' => $numberOfMincs ?? null,
            'lastInserted'  => $lastInserted[0]['UploadDate'] ?? null,
            'checkPics'      => $picArr,
        );

        // Get behavioural data
        $bvl_query  = "SELECT s.Visit_label, s.ID AS SessionID, s.Date_visit, f.Test_name, f.CommentID,
		        s.Current_stage, s.Screening, s.Visit, s.Approval, count(cu.ConflictID) AS NumOfConflict
	          FROM session s LEFT JOIN flag f ON (s.ID = f.SessionID)
	          LEFT JOIN conflicts_unresolved cu ON (cu.CommentId1=f.CommentID)
            LEFT JOIN candidate c USING (CandID)
            WHERE s.Active='Y' AND c.CandID=:candid AND f.CommentID NOT LIKE 'DDE%'
	          GROUP BY s.Visit_label, s.ID, s.Date_visit, f.Test_name, f.CommentID, s.Current_stage, s.Screening,
            s.Visit, s.Approval
	          ORDER BY s.Visit_label, f.Test_name";
        $bvl_result = $DB->pselect($bvl_query, array('candid' => $this->candID));

        $instrumentList = \Utility::getAllInstruments();
        foreach ($bvl_result as $key => $row) {
            $testName = $row['Test_name'];
            $commentID = $row['CommentID'];

            // Replace test names with full name
            $bvl_result[$key]['Test_name'] = $instrumentList[$testName];

            // Get instrument completion progress
            $instrument = \NDB_BVL_Instrument::factory(
                $testName,
                $commentID,
                '',
                false
            );
            $completion = $instrument->determineDataEntryCompletionProgress();
            $bvl_result[$key]['Completion'] = $completion;
        }

        // Group results by visit label
        $bvlData        = array();
        $visitLabelList = $candidate->getListOfVisitLabels();
        foreach ($visitLabelList as $visitLabel) {
          $bvlData[$visitLabel] = array();
          $bvl_result_keys      = array_keys(array_column($bvl_result, 'Visit_label'), $visitLabel);
          foreach($bvl_result_keys as $bvl_result_key) {
            $bvlData[$visitLabel][] = $bvl_result[$bvl_result_key];
          }
        }        

        // Add candidate's latest visit subproject and age to candidate data
        $subproject = $candidate->getLastVisitSubproject();
        $candidateData = array_merge(
            $candidate->getData(), 
            array('Subproject' => $subproject[0]['title'],
                  'Age'        => $candidate->getAge()
            )
        );
 
        $this->jsonData = array(
            'instrumentList'     => $instrumentList,
            'candID'             => $candidate->getData('CandID'),
            'pscid'              => $candidate->getPSCID(),
            'candidateData'      => $candidateData,
            'timepointData'      => $timePoints,
            'subprojectID'       => $subprojectID,
            'isDataEntryPerson'  => $isDataEntryPerson,
            'participant_status' => $participant_status,
            'consentData'        => $consent,
            'bvlData'            => $bvlData,
            'imagingData'        => $imagingData,
        );
    }
    /**
     * Determining Previous Stage
     *
     * @param string $sessionID sessionID
     *
     * @return string
     */
    function _determinePreviousStage($sessionID)
    {
        // create timepoint object
        $timePoint =& \TimePoint::singleton($sessionID);

        // outcome stage is the last stage
        //(approval || visit || screening || not started, in that order)
        // with a non-null status
        if ($timePoint->getData('Approval') != null) {
            return  'Approval';
        } elseif ($timePoint->getData('Visit') != null) {
            return  'Visit';
        } elseif ($timePoint->getData('Screening') != null) {
            return  'Screening';
        }
        return  'Not Started';
    }
    /**
     * Used by the NDB_caller class when loading a page.
     * Call the display function of the appropriate modules feedback panel.
     *
     * @param string $candID    candID
     * @param string $sessionID sessionID
     *
     * @return string
     */
    function getFeedbackPanel($candID, $sessionID = null)
    {
        $feedbackPanel = new \BVL_Feedback_Panel($candID);
        $html          = $feedbackPanel->display();
        return $html;
    }

    /**
     * Converts data to a JSON format to be retrieved with ?format=json
     *
     * @return string JSON
     */
    function toJSON()
    {
        return json_encode($this->jsonData);
    }
    
    /**
     * Get dependencies to candidate_profile for image browsing link
     *
     * @return array of javascript to be inserted
     */
    function getJSDependencies()
    {
        $factory = \NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
        $deps    = parent::getJSDependencies();
        return array_merge(
            $deps,
            array($baseURL . '/candidate_profile/js/candidateProfileIndex.js')
        );
    }

    /**
     * Generate a breadcrumb trail for this page.
     *
     * @return \LORIS\BreadcrumbTrail
     */
    public function getBreadcrumbs(): \LORIS\BreadcrumbTrail
    {
        $candid = $this->candID;
        $pscid  = $this->pscid;

        return new \LORIS\BreadcrumbTrail(
            new \LORIS\Breadcrumb(
                'Access Profile',
                '/candidate_list'
            ),
            new \LORIS\Breadcrumb(
                "Candidate Profile $candid / $pscid",
                "/$candid"
            )
        );
    }
}

