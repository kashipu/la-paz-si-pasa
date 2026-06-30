<?php

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
    wp_safe_redirect($frontend_url, 301);
    exit;
});

add_action('send_headers', function () {
    if (!is_admin()) {
        header('X-Robots-Tag: noindex, nofollow', true);
    }
});
