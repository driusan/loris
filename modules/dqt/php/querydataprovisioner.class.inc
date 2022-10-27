<?php
namespace LORIS\dqt;
use \LORIS\Data\ProvisionerInstance;
use \LORIS\StudyEntities\Candidate\CandID;

class QueryDataProvisioner extends ProvisionerInstance {
    protected \User $user;
    protected Query $query;
    public function __construct(protected \LORIS\LorisInstance $loris, protected QueryRun $QueryRun) {
        $this->query = $QueryRun->getQuery();
    }

    public function execute(\User $user) : \Traversable {
        $this->user = $user;
        return parent::execute($user);
    }

    public function getAllInstances() : \Traversable {
        $candidates = $this->QueryRun->getCandidates();

        $fielddict = [];
        $vals = [];

        $startMemory = memory_get_usage();
        $dataiterators = [];
        $fields = [];
        $fieldsarray = $this->query->getFieldsRaw();

        // Convert from an array of fieldnames to an array of
        // fieldnames per module, to minimize the number of roundtrips
        // to the module
        foreach ($fieldsarray as $field) {
            $mname = $field['module'];
            $fname = $field['field'];
            if(!isset($fields[$mname])) {
                $fields[$mname] = [];
            }
            $fields[$mname][] = $fname;
        }

        // Run the query against each module and store the resulting
        // iterators in the $dataiterators array.
        foreach ($fields as $modulename => $mfields) {
            $mStartMemory = memory_get_usage();
            $now = time();
            $engine = $this->loris->getModule($modulename)->getQueryEngine();

            $flatdict = $this->getFlattenedDictionary($engine);

            $fielddict = [];

            foreach ($mfields as $fieldname) {
                $fielddict[] = $flatdict[$fieldname];
            }

            $dataiterators[$modulename] = $engine->getCandidateData($fielddict, $candidates, null);
            $n1 = time();
            error_log("Iterator for $modulename took " . (memory_get_usage() - $mStartMemory) ." bytes and " . $n1-$now . " seconds");
        }
        return $this->mergeIterators($candidates, $dataiterators, $fieldsarray);
    }


    private function mergeIterators(array $candidates, array $iterators, array $fields) {
        foreach($candidates as $candID) {
            $val = [];
            // Initialize the row to ensure there's no unset indexes for
            // the DataIteratorBinaryStream when it does array_join.
            for($i = 0; $i < count($fields); $i++) {
                $val[$i] = '';
            }
            
            // Go through each module, if it has data for this candidate
            // put it in the appropriate columns.
            foreach($iterators as $modulename => $moduledata) {
                $mStartMemory = memory_get_usage();
                $n1 = time();
                if(is_array($moduledata)) {
                    continue;
                }
                if(!$moduledata->valid()) {
                    continue;
                }
                // modcandidate is the next candidate with data available for
                // this module iterator.

                $modcandidate = $moduledata->key();

                // The candidate data must have been sorted by 
                // CandID for our logic to work.
                // Convert to an int for the comparison so that <=
                // works. (We can't do a <= comparison on a CandID
                // object)
                assert("$candID" <= "$modcandidate");

                // If the module has data for this candID, populate it,
                // if not, don't advance the iterator.
                if("$modcandidate" == "$candID") {
                    // Go through each field and put the data in the right
                    // index if applicable.
                    $data = $moduledata->current();
                    foreach ($fields as $idx => $field) {
                        if ($field['module'] != $modulename) {
                            continue;
                        }
                        $fname = $field['field'];
                        if (!isset($data[$fname])) {
                            continue;
                        }
                        $d = $data[$fname];
                        $v = '';
                        if (is_array($d)) {
                            foreach($d as $val2) {
                                if (is_array($val2)) {
                                    $v .= join('DO NOT TRUST ME FRIEND', $val2);
                                } else {
                                    $v .= $val2;
                                }
                            }
                        } else {
                            $v = $d;
                        }
                        $val[$idx] = $v;
                    }

                    // Advance this iterator to the next row
                    // now that we've dealt with this CandID for
                    // this module.
                    $moduledata->next();
                }
                // error_log("Merging iterator for $modulename took " . (memory_get_usage() - $mStartMemory) ." bytes and " . (time()-$n1) . " seconds");
            }

            // We've went through all the module iterators and can
            // now yield the value for this CandID's row.
            yield "$candID" => $val;
        }
    }

    public function getFlattenedDictionary(\LORIS\Data\Query\QueryEngine $engine) {
        $rawdict = $engine->getDataDictionary();

        // Flattened dictionary without categories
        $dict = [];

        foreach ($rawdict as $cat) {
            foreach ($cat->getItems() as $item) {
                $dict[$item->getName()] = $item;
            }
        }
        return $dict;
    }
}
