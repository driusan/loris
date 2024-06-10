<?php

// XXX This should be made relative to __DIR__
require_once "test/integrationtests/LorisIntegrationTest.class.inc";

class neurohubTest extends LorisIntegrationTest
{
    function testPageDoesLoad()
    {
        $this->safeGet($this->url . "/neurohub/");
        $bodyText = $this->safeFindElement(
            WebDriverBy::cssSelector("#breadcrumbs")
        )->getText();
        $this->assertStringContainsString("neurohub", $bodyText);
        $this->assertStringNotContainsString(
            "You do not have access to this page.",
            $bodyText
        );
        $this->assertStringNotContainsString(
            "An error occured while loading the page.",
            $bodyText
        );
    }

    function testPageDoesNotLoadWithoutPermissions()
    {
        // Without permissions
        $this->setupPermissions(['']);
        $this->safeGet(
            $this->url . "/neurohub/"
        );

        $errorText = $this->safeFindElement(
            WebDriverBy::cssSelector("body")
        )->getText();
        $this->assertStringContainsString(
            "You do not have access to this page.",
            $errorText
        );
    }
}