<?php 
/**
 * Check and set default settings for {THEMENAME}
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

if ( ! function_exists( 'default_theme_settings' ) ) {
	function default_theme_settings() {
		
		$setting_name = get_theme_mod( 'setting_name' );
		if ( '' == $setting_name ) {
			set_theme_mod( 'setting_name', 'default setting here' );
		}
	}
}