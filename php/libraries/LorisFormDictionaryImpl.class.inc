<?php declare(strict_types=1);
use \LORIS\Data\Dictionary\DictionaryItem;
use \LORIS\Data\Dictionary\Category;
/**
 * Helper to extract a dictionary from a LorisForm, primarily
 * used by instruments. This is based on lorisform_parser.php
 *
 * @license http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
trait LorisFormDictionaryImpl
{
    /**
     * Recursively extract non-group elements from $elements, and
     * return the dictionary of the items.
     *
     * @param Category $cat        The dictionary category to use for the
     *                             items
     * @param array    $elements   The LorisForm elements in the format
     *                             of LorisForm->toElementArray().
     * @param string   $groupLabel The quickform group being recursively
     *                             extracted
     *
     * @return DictionaryItem[]
     */
    private function _getDataDictionaryGroup(
        \LORIS\Data\Dictionary\Category $cat,
        array $elements,
        string $groupLabel=''
    ) : array {
        $items = [];
        foreach ($elements AS $element) {
            if (!empty($element['label'])) {
                $label = str_replace("&nbsp;", "", $element['label']);
                $label = trim(preg_replace('/\s+/', ' ', $label));
            } else {
                $label = trim(preg_replace('/\s+/', ' ', $groupLabel));
            }

            switch($element['type']) {
            case 'select':
            case 'text':
            case 'textarea':
            case 'textdate':
            case 'advcheckbox':
            case 'time':
            case 'static':
                if (array_key_exists('name', $element)) {
                    $items[] = new DictionaryItem($element['name'], $label, $cat);
                }
                break;
            case 'group':
                $items = array_merge(
                    $items,
                    $this->_getDataDictionaryGroup(
                        $cat,
                        $element['elements'],
                        $label,
                    ),
                );
                break;
            }
        }
        return $items;
    }

    /**
     * Extract the data dictionary from an instrument as per the LorisForm.
     *
     * @return DictionaryItem[]
     */
    public function getDataDictionary() : iterable
    {
        $subtests =$this->getSubtestList();
        foreach ($subtests as $subtest) {
            $this->page =$subtest['Name'];
            if (method_exists($this, '_setupForm')) {
                $this->_setupForm();
            }
        }

        $formElements = $this->form->toElementArray();
        $cat          = new ategory($this->testName, $this->getFullName());
        return $this->_getDataDictionaryGroup($cat, $formElements["elements"], '');
    }
}
