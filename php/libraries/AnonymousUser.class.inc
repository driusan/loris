<?php
namespace LORIS;

class AnonymousUser extends \User {
    function getSiteNames() {
        return array("Noe");
    }
}
