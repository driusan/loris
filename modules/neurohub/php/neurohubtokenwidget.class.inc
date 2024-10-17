<?php declare(strict_types=1);
namespace LORIS\neurohub;

class NeuroHubTokenWidget extends \LORIS\my_preferences\UserPreferenceWidget
{
    public function onSave(array $values): string{
	$DB = $this->loris->getDatabaseConnection();
	$user = \NDB_Factory::singleton()->user();

	if (empty($values['neurohubtoken'])) {
		$DB->delete('neurohub_tokens', ['user' => $user->getId()]);
	} else {
		$DB->replace('neurohub_tokens', ['user' => $user->getId(), 'token' => $values['neurohubtoken']]); 
	}
	return '';
	}
}
