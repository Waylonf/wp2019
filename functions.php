<?php
/**
 * {THEMENAME} functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package WordPress
 * @subpackage {THEMENAME}
 * @since {THEMEVERSION}
 */

/**
 * Exit if accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) : exit; endif;

/**
 * {THEMENAME} only works in WordPress 4.7 or later.
 */
if ( version_compare( $GLOBALS['wp_version'], '4.7', '<' ) ) {
	require get_template_directory() . '/inc/compatibility.php';
	return;
}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 */
require get_template_directory() . '/inc/theme-defaults.php';
require get_template_directory() . '/inc/theme-setup.php';
require get_template_directory() . '/inc/theme-plugins.php';