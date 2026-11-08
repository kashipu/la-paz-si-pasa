<?php
/**
 * Versión del script = fecha de modificación, para invalidar la caché al cambiarlo.
 *
 * @package lapaz
 */

return array(
	'dependencies' => array(),
	'version'      => (string) filemtime( __DIR__ . '/view.js' ),
);
