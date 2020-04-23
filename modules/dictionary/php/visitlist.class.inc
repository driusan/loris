<?php
namespace LORIS\dictionary;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

/**
 * Implements an end point to retrieve the visit list for
 * a specific dictionary item.
 *
 * @license http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class VisitList extends \NDB_Page
{
    protected $itemmodule;
    protected $itemcategory;
    protected $dictionaryitem;

    /**
     * {@inheritDoc}
     *
     * @param ServerRequestInterface $request The incoming HTTP request object
     *
     * @return ResponseInterface
     */
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        if ($this->dictionaryitem === null) {
            return new \LORIS\Http\Response\JSON\BadRequest(
                'Invalid dictionary item for visit list'
            );
        }

        if ($this->dictionaryitem->getScope()->__toString() !== 'session') {
            return new \LORIS\Http\Response\JSON\BadRequest(
                'Visit list only applicable to session scoped variables'
            );
        }

        return new \LORIS\Http\Response\JSON\OK(
            [
                'Visits' => $this->itemmodule
                    ->getQueryEngine()
                    ->getVisitList($this->itemcategory, $this->dictionaryitem),
            ],
        );
    }

    /**
     * {@inheritDoc}
     *
     * @param \User                  $user    The user making the request
     * @param ServerRequestInterface $request The incoming HTTP request
     *
     * @return void
     */
    public function loadResources(
        \User $user, ServerRequestInterface $request
    ) : void {
        $queryparams = $request->getQueryParams();
        if (!isset($queryparams['module']) || !isset($queryparams['item'])) {
            return;
        }

        $this->lorisinstance = $request->getAttribute("loris");
        $modules = $this->lorisinstance->getActiveModules();

        foreach ($modules as $module) {
            if ($module->getName() !== $queryparams['module']) {
                continue;
            }
            if (!$module->hasAccess($user)) {
                continue;
            }

            $this->itemmodule = $module;
            $mdict            = $module->getQueryEngine()->getDataDictionary();

            if (count($mdict) > 0) {
                foreach ($mdict as $cat) {
                    foreach ($cat->getItems() as $dictitem) {
                        if ($dictitem->getName() === $queryparams['item']) {
                            $this->dictionaryitem = $dictitem;
                            $this->itemcategory   = $cat;
                        }
                    }
                }
            }
        }
    }
}
