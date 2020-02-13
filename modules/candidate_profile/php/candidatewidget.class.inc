<?php declare(strict_types=1);
/**
 * File contains the \LORIS\dashboard\Widget class.
 *
 * PHP Version 7
 *
 * @category Main
 * @package  Loris
 * @author   Dave MacFarlane <dave.macfarlane@mcin.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris
 */
namespace LORIS\candidate_profile;

/**
 * A \LORIS\dashboard\Widget is a type of \LORIS\GUI\Widget which has some additional
 * properties to make it more consistent across widgets that appear on the dashboard.
 *
 * Dashboard Widgets have a size ("small" things going on the right column, and
 * "normal" on the main dashboard area.), a relative ordering (ordering is
 * unspecified within widgets that have the same order), a title, footer, and may
 * optionally register extra CSS or JS to be loaded for the widget to function
 * correctly.
 *
 * @category Main
 * @package  Loris
 * @author   Dave MacFarlane <dave.macfarlane@mcin.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris
 */
class CandidateWidget implements \LORIS\GUI\Widget
{
    /**
     * Construct a dashboard widget with the specified properties.
     *
     * @param WidgetContent       $content The content to display in a dashboard
     *                                     panel.
     * @param WidgetDisplayProps  $props   Display related properties such as size
     *                                     and order.
     * @param ?WidgetDependencies $deps    Optional dependencies such as CSS or JS
     *                                     for this widget.
     */
    public function __construct(
        string $title,
        string $jsurl,
        ?int $width = null,
        ?int $height = null
    ) {
        $this->title = $title;
        $this->url = $jsurl;
        $this->width = $width;
        $this->height = $height;
    }


    /**
     * Renders the widget within a dashboard panel and implements
     * the \LORIS\GUI\Widget interface.
     *
     * @return string the HTML content of the widget to be rendered
     */
    public function __toString()
    {
        return $this->url;
    }

    public function getTitle() : string {
        return $this->title;
    }

    public function getWidth() : ?int {
        return $this->width;
    }

    public function getHeight() : ?int {
        return $this->height;
    }

    public function getJSURL() : string {
        return $this->url;
    }
}
