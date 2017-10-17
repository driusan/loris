<?php

interface Page {
    public function display() : ResponseInterface
}

interface Accessor {
    public function hasAccess(User) : bool
}
?>
