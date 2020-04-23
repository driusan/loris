<?php
declare(strict_types=1);
namespace LORIS\candidate_parameters;
use LORIS\Data\Scope;
use LORIS\Data\Cardinality;

use LORIS\Data\Dictionary\Category;
use LORIS\Data\Dictionary\DictionaryItem;

/**
 * {@inheritDoc}
 *
 * @license http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 */
class CandidateQueryEngine implements \LORIS\Data\Query\QueryEngine
{
    protected \LORIS\LorisInstance $loris;

    /**
     * Construct a CandidateQueryEngine object
     *
     * @param \LORIS\LorisInstance $loris The LORIS instance being queried.
     */
    function __construct(\LORIS\LorisInstance $loris)
    {
        $this->loris = $loris;
    }

    /**
     * Return a data dictionary of data types managed by this module.
     * DictionaryItems are grouped into categories and a module may
     * provide 0 or more categories of dictionaryitems.
     *
     * @return \LORIS\Data\Dictionary\Category[]
     */
    public function getDataDictionary() : iterable
    {
        $candscope = new Scope(Scope::CANDIDATE);
        $sesscope  = new Scope(Scope::SESSION);

        $ids = (new \LORIS\Data\Dictionary\Category(
            "Identifiers",
            "Candidate Identifiers",
        ))->withItems(
            [
                new DictionaryItem(
                    "CandID",
                    "LORIS Candidate Identifier",
                    $candscope,
                    new \LORIS\Data\Types\IntegerType(999999),
                    new Cardinality(Cardinality::UNIQUE),
                ),
                new DictionaryItem(
                    "PSCID",
                    "Project Candidate Identifier",
                    $candscope,
                    new \LORIS\Data\Types\StringType(255),
                    new Cardinality(Cardinality::SINGLE),
                ),
            ]
        );

        $demographics = (new \LORIS\Data\Dictionary\Category(
            "Demographics",
            "Candidate Demographics"
        )
        )->withItems(
            [
                new DictionaryItem(
                    "DoB",
                    "Date of Birth",
                    $candscope,
                    new \LORIS\Data\Types\DateType(),
                    new Cardinality(Cardinality::SINGLE),
                ),
                new DictionaryItem(
                    "DoD",
                    "Date of Death",
                    $candscope,
                    new \LORIS\Data\Types\DateType(),
                    new Cardinality(Cardinality::OPTIONAL),
                ),
                new DictionaryItem(
                    "Sex",
                    "Candidate's biological sex",
                    $candscope,
                    new \LORIS\Data\Types\Enumeration('Male', 'Female', 'Other'),
                    new Cardinality(Cardinality::SINGLE),
                ),
                new DictionaryItem(
                    "EDC",
                    "Expected Data of Confinement",
                    $candscope,
                    new \LORIS\Data\Types\DateType(),
                    new Cardinality(Cardinality::OPTIONAL),
                ),
            ]
        );

        $meta = new \LORIS\Data\Dictionary\Category("Meta", "Other parameters");

        $db = $this->loris->getDatabaseConnection();
        $participantstatus_options = $db->pselectCol(
            "SELECT Description FROM participant_status_options",
            []
        );
        $meta = $meta->withItems(
            [
                new DictionaryItem(
                    "VisitLabel",
                    "The study visit label",
                    $sesscope,
                    new \LORIS\Data\Types\StringType(255),
                    new Cardinality(Cardinality::UNIQUE),
                ),
                new DictionaryItem(
                    "Project",
                    "The LORIS project to categorize this session",
                    $sesscope,
                    new \LORIS\Data\Types\StringType(255), // FIXME: Make an enum
                    new Cardinality(Cardinality::SINGLE),
                ),
                new DictionaryItem(
                    "Subproject",
                    "The LORIS subproject used for battery selection",
                    $sesscope,
                    new \LORIS\Data\Types\StringType(255),
                    new Cardinality(Cardinality::SINGLE),
                ),
                new DictionaryItem(
                    "Site",
                    "The Site at which a visit occurred",
                    $sesscope,
                    new \LORIS\Data\Types\Enumeration(...\Utility::getSiteList()),
                    new Cardinality(Cardinality::SINGLE),
                ),
                new DictionaryItem(
                    "EntityType",
                    "The type of entity which this candidate represents",
                    $candscope,
                    new \LORIS\Data\Types\Enumeration('Human', 'Scanner'),
                    new Cardinality(Cardinality::SINGLE),
                ),
                new DictionaryItem(
                    "ParticipantStatus",
                    "The status of the participant within the study",
                    $candscope,
                    new \LORIS\Data\Types\Enumeration(...$participantstatus_options),
                    new Cardinality(Cardinality::SINGLE),
                ),
                new DictionaryItem(
                    "RegistrationSite",
                    "The site at which this candidate was initially registered",
                    $candscope,
                    new \LORIS\Data\Types\Enumeration(...\Utility::getSiteList()),
                    new Cardinality(Cardinality::SINGLE),
                ),
                new DictionaryItem(
                    "RegistrationProject",
                    "The project for which this candidate was initially registered",
                    $candscope,
                    new \LORIS\Data\Types\StringType(255), // FIXME: Make an enum
                    new Cardinality(Cardinality::SINGLE),
                ),
            ]
        );
        return [$ids, $demographics, $meta];
    }

    /**
     * {@inheritDoc}
     *
     * @param Category       $inst The category containing the DictionaryItem.
     * @param DictionaryItem $item The item we want visit lists for.
     *
     * @return iterable
     */
    public function getVisitList(
        \LORIS\Data\Dictionary\Category $inst,
        \LORIS\Data\Dictionary\DictionaryItem $item
    ) : iterable {
        // FIXME: Implement
        return \Utility::getVisitList();
    }

}
