<?php
namespace LORIS\candidates;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

class Categories extends \NDB_Page {

    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        $queryparams = $request->getQueryParams();
        if (isset($queryparams['module'])) {
            return $this->moduleDictionary($request, $queryparams['module']);
        }
        $amodules = [];
        foreach($this->modules as $module) {
            $amodules[$module->getName()] = $module->getLongName();
        }

        return new \LORIS\Http\Response\JSON\OK( [
            'modules' => $amodules,
            'categories' => $this->categories,
        ]);
    }

    public function loadResources(
        \User $user, ServerRequestInterface $request
    ) : void
    {
        $this->lorisinstance = $request->getAttribute("loris");
        $modules = $this->lorisinstance->getActiveModules();
        $usermodules = [];
        $dict = [];
        $categories = [];

        $this->categoryitems = [];
        foreach ($modules as $module) {
            if(!$module->hasAccess($user)) {
                continue;
            }

            $mdict = $module->getDataDictionary($this->lorisinstance);
            $mname = $module->getName();

            if(count($mdict) > 0) {
                $usermodules[] = $module;
                $categories[$mname] = [];


                foreach($mdict as $cat) {
                    $categories[$mname][$cat->getName()] = $cat->getDescription();
                    $this->categoryitems[] = [
                        'Module' => $module,
                        'Category' => $cat,
                    ];
                }
            }
        }
        $this->modules = $usermodules;
        $this->categories = $categories;
    }

    public function moduleDictionary(ServerRequestInterface $request, string $modulename) : ResponseInterface
    {
        $loris = $this->lorisinstance;
        $module = null;
        foreach ($loris->getActiveModules() as $m) {
            if ($m->getName() == $modulename) {
                $module = $m;
                break;
            }
        }

        if($module === null) {
            return new \LORIS\Http\Response\JSON\NotFound('module not found');
        }
        $mdict = $module->getDataDictionary($loris);
        $dict  = [];

        foreach ($mdict as $cat) {
            $catdict = [];

            foreach($cat->getItems() as $item) {
                $catdict[$item->getName()] = [
                    'description' => $item->getDescription(),
                    'scope' => $item->getScope(),
                    'type' => $item->getDataType(),
                    'cardinality' => $item->getCardinality(),
                ];
            }
            $dict[$cat->getName()] = $catdict;
        }
        return new \LORIS\Http\Response\JSON\OK($dict);
    }
}
