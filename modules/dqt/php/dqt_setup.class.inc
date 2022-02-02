<?php
/**
 * The DQT_Setup 'endpoint' class for the DQT Module.
 *
 * PHP Version 7.4
 *
 * @category   API
 * @package    Loris
 * @subpackage DQT
 * @author     Alizée Wickenheiser <alizee.wickenheiser@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Loris/
 */
namespace LORIS\dqt;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Server\RequestHandlerInterface;
use \Psr\Http\Message\ResponseInterface;

/**
 * A class for handling the /dqt/dqt_setup/ endpoint.
 * The initial DQT setup process calls this API for the
 * ProgressBar's stream "reader" to get the needed
 * setup data from couchDB.
 *
 * PHP Version 7.4
 *
 * @category   API
 * @package    LORIS
 * @subpackage DQT
 * @author     Alizée Wickenheiser <alizee.wickenheiser@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Lors/
 */
class Dqt_Setup extends \NDB_Form implements RequestHandlerInterface
{
    public $skipTemplate = true;

    /**
     * Returns true if user has access to this Endpoint.
     *
     * @param \User $user The user whose access is being checked
     *
     * @return bool
     */
    function _hasAccess(\User $user) : bool
    {
        return $user->hasPermission('dataquery_view');
    }

    /**
     * Return which methods are supported by this endpoint.
     *
     * @return array supported HTTP methods
     */
    protected function allowedMethods() : array
    {
        return [
            'GET',
        ];
    }

    /**
     * Process the ServerRequestInterface
     *
     * @param ServerRequestInterface  $request The PSR7 request.
     * @param RequestHandlerInterface $handler The request handler.
     *
     * @return ResponseInterface The outgoing PSR7 response.
     */
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ) : ResponseInterface {
        return $handler->handle($request);
    }

    /**
     * Handles Endpoint request for the initial DQT setup that needs
     * the ProgressBar's stream "reader" to get the needed setup data
     * from couchDB.
     *
     * @param ServerRequestInterface $request The incoming PSR7 request
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        $data['visits']       = \Utility::getVisitList();
        // Note: StringStream since BinaryStream isn't in 23.0-release.
        return (new \LORIS\Http\Response())
            ->withStatus(200)
            ->withHeader("Content-Type", "application/json")
            ->withBody(
                new \LORIS\Http\StringStream(
                    json_encode($data)
                )
            );
    }
}
