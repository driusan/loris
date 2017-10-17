<?php
namespace LORIS\Http;
/**
 * The \LORIS\Http namespace contains LORIS implementations of the 
 * in the \Psr\Http\Message interfaces.
 * 
 * In particular, it currently implements a PSR7 (HTTP Message) implementation.
 *
 * This will form the basis for a more modern routing replacement for the
 * archaic NDB_Caller implementation, and should allow the development of
 * (likely PSR15-based) middleware components within LORIS in the future.
 *
 * @todo Replace static fromGlobals functions with a PSR17 (PSR7 Factory)
 *       implementation
 * @todo Ensure that the semantics of all classes in namespce meet the PSR7
 *       standard
 * @todo Update @since tag to the version of LORIS which this goes into.
 * @todo Add a ServerRequest parameter to Module::LoadPage, and to appropriate
 *       places in NDB_Page, so that modules can begin experimenting with this.
 *
 * @see http://www.php-fig.org/psr/psr-7/
 * @since 19.0.0 Introduced \LORIS\Http namespace with PSR7 implementation.
 */
