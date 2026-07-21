<?php
/**
 * Plugin Name: Headless Core
 * Description: Exposes a small, safe WordPress contract for the Astro frontend.
 * Version: 0.1.0
 * Author: William Moreno
 */

defined('ABSPATH') || exit;

add_action('after_setup_theme', function () {
    add_theme_support('custom-logo');

    register_nav_menus([
        'primary' => 'Primary navigation',
        'footer' => 'Footer navigation',
    ]);
});

add_action('rest_api_init', function () {
    register_rest_route('headless/v1', '/site', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => 'headless_core_site_settings',
    ]);

    foreach (['page', 'post'] as $post_type) {
        register_rest_field($post_type, 'headless_blocks', [
            'get_callback' => function ($post) {
                return headless_core_normalize_blocks(parse_blocks(get_post_field('post_content', $post['id'])));
            },
            'schema' => [
                'description' => 'Parsed blocks for the headless Astro renderer.',
                'type' => 'array',
                'context' => ['view'],
            ],
        ]);
    }
});

function headless_core_site_settings() {
    $logo_id = get_theme_mod('custom_logo');
    $logo = $logo_id ? wp_get_attachment_image_src($logo_id, 'full') : null;

    return [
        'name' => get_bloginfo('name'),
        'description' => get_bloginfo('description'),
        'logo' => $logo ? [
            'id' => (int) $logo_id,
            'src' => $logo[0],
            'width' => (int) $logo[1],
            'height' => (int) $logo[2],
            'alt' => get_post_meta($logo_id, '_wp_attachment_image_alt', true),
        ] : null,
        'menus' => [
            'primary' => headless_core_menu('primary'),
            'footer' => headless_core_menu('footer'),
        ],
        'tokens' => [
            'colors' => [
                'brand' => get_option('headless_brand_color', '#171717'),
                'accent' => get_option('headless_accent_color', '#0f766e'),
                'surface' => get_option('headless_surface_color', '#ffffff'),
                'text' => get_option('headless_text_color', '#1c1917'),
            ],
        ],
    ];
}

function headless_core_menu($location) {
    $locations = get_nav_menu_locations();

    if (!isset($locations[$location])) {
        return [];
    }

    $items = wp_get_nav_menu_items($locations[$location]);

    if (!$items) {
        return [];
    }

    return array_values(array_map(function ($item) {
        return [
            'id' => (int) $item->ID,
            'label' => $item->title,
            'url' => $item->url,
            'parentId' => (int) $item->menu_item_parent,
            'order' => (int) $item->menu_order,
            'target' => $item->target,
        ];
    }, $items));
}

function headless_core_normalize_blocks($blocks) {
    return array_values(array_filter(array_map(function ($block) {
        if (empty($block['blockName'])) {
            return null;
        }

        return [
            'name' => $block['blockName'],
            'attrs' => $block['attrs'] ?? [],
            'innerHTML' => $block['innerHTML'] ?? '',
            'innerBlocks' => headless_core_normalize_blocks($block['innerBlocks'] ?? []),
        ];
    }, $blocks)));
}
