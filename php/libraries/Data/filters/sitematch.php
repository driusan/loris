<?php
/** 
 * \LORIS\Data\Filters provides standard implementations of common data filters that are
 * used throughout LORIS modules.
 */
namespace LORIS\Data\Filters;

class SiteMatch implements \LORIS\Data\Filter {
    public function Filter(\User $user, \Loris\Data\Instance $resource) : bool {
        if (method_exists($resource, 'getCenterIDs')) {
            // If the Resource belongs to multiple CenterIDs, the user can access the data if the
            // user is part of any of thos centers.
            $resourceSites = $resource->getCenterIDs();
            foreach ($resourceSites as $site) {
                if ($user->hasCenter($resourceSite)) {
                       return true;
                }
            }
            return false;
        } else if (method_exists($resource, 'getCenterID')) {
            $resourceSite = $resource->getCenterID();
            return $user->hasCenter($resourceSite);
        }
        throw new \LorisException("Can not implement SiteMatchFilter on a resource type that doesn't have sites.");
    }
}
