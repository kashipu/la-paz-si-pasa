<?php
/**
 * Plugin Name: Headless Cache Purge
 * Description: Notifies the Astro frontend to drop its page cache when content changes in WordPress.
 * Version: 0.1.0
 * Author: William Moreno
 */

defined('ABSPATH') || exit;

function headless_cache_notify() {
    $secret = getenv('REVALIDATE_SECRET');

    if (!$secret) {
        return;
    }

    $frontend_url = getenv('PUBLIC_SITE_URL') ?: 'http://localhost:4321';

    wp_remote_post(rtrim($frontend_url, '/') . '/api/revalidate', [
        'timeout' => 3,
        'blocking' => false,
        'headers' => [
            'X-Revalidate-Secret' => $secret,
            'Content-Type' => 'application/json',
            // Astro 5 valida el origen en las peticiones POST (security.checkOrigin).
            // Sin esta cabecera responde 403 y la purga nunca llega al endpoint.
            'Origin' => rtrim($frontend_url, '/'),
        ],
        'body' => '{}',
    ]);
}

function headless_cache_notify_on_save($post_id) {
    if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
        return;
    }

    headless_cache_notify();
}

add_action('save_post', 'headless_cache_notify_on_save');
add_action('deleted_post', 'headless_cache_notify');
add_action('wp_update_nav_menu', 'headless_cache_notify');
