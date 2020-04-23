<?php declare(strict_types=1);

trait LorisFormDictionaryImpl {
    private function getDataDictionaryGroup(
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
                    $items[] = new LORIS\Data\Dictionary\DictionaryItem($element['name'], $label, $cat);
                }
                break;
            case 'group':
                $items = array_merge($items, $this->getDataDictionaryGroup($cat, $element['elements'], $label));
                break;
            }
        }
        return $items;
    }

    public function getDataDictionary() : iterable {
        $subtests =$this->getSubtestList();
        foreach ($subtests as $subtest) {
            $this->page =$subtest['Name'];
            if(method_exists($this, '_setupForm')) {
                $this->_setupForm();
            }
        }

        $formElements = $this->form->toElementArray();
        $cat = new \LORIS\Data\Dictionary\Category($this->testName, $this->getFullName());
        return $this->getDataDictionaryGroup($cat, $formElements["elements"], '');
    }
}
