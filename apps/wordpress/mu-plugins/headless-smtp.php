<?php
/**
 * Plugin Name: Headless SMTP
 * Description: Routes wp_mail() through an SMTP provider so password resets reach real users. No-ops when SMTP_HOST is unset.
 * Version: 0.1.0
 * Author: William Moreno
 */

defined('ABSPATH') || exit;

// Local dev and any environment without SMTP configured keep WordPress' default
// mail() behaviour instead of failing on a half-configured transport.
if (!getenv('SMTP_HOST')) {
    return;
}

add_action('phpmailer_init', function ($phpmailer) {
    $port = (int) (getenv('SMTP_PORT') ?: 587);

    $phpmailer->isSMTP();
    $phpmailer->Host = getenv('SMTP_HOST');
    $phpmailer->Port = $port;
    $phpmailer->SMTPAuth = true;
    $phpmailer->Username = getenv('SMTP_USER');
    $phpmailer->Password = getenv('SMTP_PASS');
    $phpmailer->SMTPSecure = $port === 465 ? 'ssl' : 'tls';
});

// The From address must live on the DKIM-signed domain or DMARC alignment fails
// and the message lands in spam, whatever the provider says it sent.
add_filter('wp_mail_from', function ($from) {
    return getenv('SMTP_FROM') ?: $from;
});

add_filter('wp_mail_from_name', function ($name) {
    return getenv('SMTP_FROM_NAME') ?: $name;
});

// Delivery failures are silent by default — WordPress tells the user the mail
// was sent either way. Log them so the container logs show what happened.
add_action('wp_mail_failed', function ($error) {
    error_log('[headless-smtp] ' . $error->get_error_message());
});
