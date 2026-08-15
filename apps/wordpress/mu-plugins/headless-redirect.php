<?php
/**
 * Plugin Name: Headless Redirect
 * Description: Redirects public WordPress frontend traffic to Astro; keeps wp-admin, wp-login.php, wp-json and uploads reachable.
 * Version: 0.1.0
 * Author: William Moreno
 */

defined('ABSPATH') || exit;

add_action('template_redirect', function () {
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';

    if (
        is_admin()
        || wp_doing_ajax()
        || wp_is_json_request()
        || (defined('REST_REQUEST') && REST_REQUEST)
        || str_starts_with($request_uri, '/wp-json')
        || str_starts_with($request_uri, '/wp-content/uploads')
    ) {
        return;
    }

    $frontend_url = getenv('PUBLIC_SITE_URL') ?: 'http://localhost:4321';
    // wp_redirect y no wp_safe_redirect: el destino es otro dominio, y la variante "safe"
    // solo permite hosts en allowed_redirect_hosts (de fabrica, el propio sitio). Ante un
    // host externo no falla: cae a su fallback y manda a /wp-admin/, que es donde acababa
    // este redirect en produccion. Aqui la URL sale de una variable de entorno del
    // servidor, no de la peticion, asi que no hay superficie de open redirect que cubrir.
    wp_redirect($frontend_url, 301);
    exit;
});

add_action('send_headers', function () {
    if (!is_admin()) {
        header('X-Robots-Tag: noindex, nofollow', true);
    }
});
