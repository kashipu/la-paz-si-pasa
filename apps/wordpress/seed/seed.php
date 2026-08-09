<?php
/**
 * Carga el contenido de contenido.json en los CPT del micrositio.
 *
 * Esta carpeta se monta en /opt/seed (fuera del webroot: contiene PHP y no debe
 * ser accesible por HTTP). Se ejecuta con wp-cli:
 *
 *   docker compose run --rm --user 33 wpcli wp eval-file /opt/seed/seed.php
 *
 * El --user 33 es necesario: la imagen wpcli es Alpine y ahí www-data es uid 82,
 * pero la de WordPress es Debian y usa uid 33, dueño de wp-content/uploads.
 *
 * Es idempotente: busca cada entrada por título y post_type, y la actualiza en
 * vez de duplicarla. Los medios se reconocen por nombre de archivo, así que si
 * ya los subiste por wp-admin no se duplican.
 */

$base = __DIR__;
$datos = json_decode(file_get_contents($base . '/contenido.json'), true);
if (!$datos) {
    WP_CLI::error('No se pudo leer contenido.json');
}

require_once ABSPATH . 'wp-admin/includes/image.php';

/** Sube el archivo a la biblioteca de medios, o devuelve el que ya esté. */
function medio($ruta_relativa)
{
    // __DIR__ y no una variable de nivel de archivo: wp-cli incluye este script
    // dentro de una función, así que $base de arriba no es global.
    $ruta = __DIR__ . '/media/' . $ruta_relativa;
    if (!file_exists($ruta)) {
        WP_CLI::warning("falta el archivo: $ruta_relativa");
        return 0;
    }
    $nombre = basename($ruta);
    $previos = get_posts([
        'post_type' => 'attachment',
        'name' => sanitize_title(pathinfo($nombre, PATHINFO_FILENAME)),
        'posts_per_page' => 1,
        'post_status' => 'inherit',
    ]);
    if ($previos) {
        return $previos[0]->ID;
    }

    $subida = wp_upload_bits($nombre, null, file_get_contents($ruta));
    if (!empty($subida['error'])) {
        WP_CLI::warning("no se pudo subir $nombre: {$subida['error']}");
        return 0;
    }
    $id = wp_insert_attachment([
        'post_mime_type' => $subida['type'],
        'post_title' => pathinfo($nombre, PATHINFO_FILENAME),
        'post_status' => 'inherit',
    ], $subida['file']);
    wp_update_attachment_metadata($id, wp_generate_attachment_metadata($id, $subida['file']));
    return $id;
}

/** Crea o actualiza un post del CPT y le escribe los campos SCF. */
function upsert($post_type, $titulo, $campos)
{
    $previos = get_posts([
        'post_type' => $post_type,
        'title' => $titulo,
        'posts_per_page' => 1,
        'post_status' => 'any',
    ]);
    $id = $previos
        ? $previos[0]->ID
        : wp_insert_post([
            'post_type' => $post_type,
            'post_title' => $titulo,
            'post_status' => 'publish',
        ], true);

    if (is_wp_error($id)) {
        WP_CLI::warning("$post_type «$titulo»: {$id->get_error_message()}");
        return;
    }
    foreach ($campos as $nombre => $valor) {
        update_field($nombre, $valor, $id);
    }
    WP_CLI::log(sprintf('%-13s %s  #%d %s', $post_type, $previos ? 'actualizado' : 'creado     ', $id, $titulo));
}

foreach ($datos['retratos'] as $r) {
    upsert('retrato', $r['titulo'], [
        'foto' => medio($r['archivo']),
        'descripcion' => $r['descripcion'],
        'proyecto' => $r['proyecto'],
        'lugar' => $r['lugar'],
    ]);
}

foreach ($datos['videos'] as $v) {
    upsert('video', $v['titulo'], [
        'descripcion' => $v['descripcion'],
        'fuente_video' => 'youtube',
        'youtube_url' => $v['youtube_url'],
        'tags' => $v['tags'],
    ]);
}

foreach ($datos['ferias'] as $f) {
    upsert('feria', $f['titulo'], [
        'descripcion' => $f['descripcion'],
        // galeria se deja vacía: las fotos siguen sin enlace en SharePoint
        'fuente_video' => isset($f['video_youtube']) ? 'youtube' : '',
        'video_youtube' => $f['video_youtube'] ?? '',
        'orden' => $f['orden'],
        'abierta_por_defecto' => !empty($f['abierta_por_defecto']),
    ]);
}

foreach ($datos['audio_relatos'] as $a) {
    upsert('audio_relato', $a['productor'] . ' — ' . $a['marca'], [
        'productor' => $a['productor'],
        'marca' => $a['marca'],
        'lugar' => $a['lugar'],
        'audio' => medio($a['archivo']),
        // subtitulos queda vacío: la transcripción no está en el Excel
        'orden' => $a['orden'],
    ]);
}

WP_CLI::success('contenido cargado');
