<?php
namespace LORIS\instruments\schematypes;
use \PSR\Http\Message\ServerRequestInterface;
use \Psr\Http\Server\RequestHandlerInterface;
use \PSR\Http\Message\ResponseInterface;

class ZJSON extends \NDB_BVL_Instrument {
    protected array $json;
    private string $defaultLang;

    function __construct(
        protected \LORIS\LorisInstance $loris,
        public $module,
        protected string $commentid,
        string $jsoncontent
        
    ) {
        $this->json = json_decode($jsoncontent, true, JSON_THROW_ON_ERROR);
        // FIXME: Do some validation that required things are defined.
        $this->defaultLang = $this->json['schema']['meta']['defaultLanguage'];
        parent::__construct($loris, $module, "", $commentid, $commentid);
    }
    function getFullName() : string {
        return $this->json['schema']['meta']['longName'][$this->defaultLang];
    }
    function getSubtestList() : array {
        // FIXME: Parse from schema.setup
        return [];
    }
    function getDataDictionary() : iterable {
        // FIXME: Parse from schema.elements
        return [];
    }
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ) : ResponseInterface {
        $this->logger->debug("ZJSON middleware called");
        $user = $request->getAttribute("user");
        return (new \LORIS\Middleware\PageDecorationMiddleware($user))
                ->process(
                    $request,
                    $this,
                    );
       
    }

    function getControlPanel(): string {
        // Test name is undefined, so avoid the NDB_BVL_Instrument
        // control panel for now.
        return "";
    }
    function handle(ServerRequestInterface $request) : ResponseInterface {
        return (new \LORIS\Http\Response())
            ->withBody(new \LORIS\Http\StringStream("

            <div id=\"instrumentroot\"></div>
            <script>lorisjs.instruments.ZJSON.RenderZJSON('"
                . json_encode($this->json)
                . "')</script>"
            ));
    }
    function getJSDependencies()
    {
        $factory = \NDB_Factory::singleton();
        $depends = parent::getJSDependencies();
        $baseURL = $factory->settings()->getBaseURL();
        return array_merge(
            $depends,
            [
                $baseURL . '/instruments/js/ZJSON.js'
            ]
        );
    }
}
