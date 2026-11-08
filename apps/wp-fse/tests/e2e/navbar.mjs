// Pruebas de comportamiento y visuales del navbar (core/navigation) con Chrome headless (CDP).
//
//   node tests/e2e/navbar.mjs                       comportamiento contra http://localhost:8090
//   node tests/e2e/navbar.mjs --visual              además compara píxeles contra tests/e2e/baseline/
//   node tests/e2e/navbar.mjs --baseline <astro>    captura las bases desde Astro (antes de retirarlo)
//
// Variables: SITE_URL (por defecto http://localhost:8090), CHROME_BIN.
// Lo visual es solo local: las fuentes se rasterizan distinto en Linux (CI) y macOS.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const args = process.argv.slice( 2 );
const baselineFrom = args.includes( '--baseline' ) ? args[ args.indexOf( '--baseline' ) + 1 ] : null;
const visual = args.includes( '--visual' );
const site = process.env.SITE_URL ?? 'http://localhost:8090';
const baseDir = path.join( import.meta.dirname, 'baseline' );
const chrome =
	process.env.CHROME_BIN ??
	( process.platform === 'darwin'
		? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
		: 'google-chrome' );

// Selectores de cada implementación para las mismas piezas del navbar.
const targets = {
	wp: {
		header: 'header.site-header',
		toggle: '.lapaz-nav-mobile .wp-block-navigation__responsive-container-open',
		overlay: '.lapaz-nav-mobile .wp-block-navigation__responsive-container',
		openClass: 'is-menu-open',
		desktop: 'nav.lapaz-nav-desktop',
	},
	astro: {
		header: 'header.site-header',
		toggle: '.nav__toggle',
		overlay: '.nav__list',
		openClass: 'is-open',
		desktop: 'nav.nav:last-of-type',
	},
};

const sleep = ( ms ) => new Promise( ( r ) => setTimeout( r, ms ) );
const port = 9400 + Math.floor( Math.random() * 400 );
const profile = fs.mkdtempSync( path.join( process.env.TMPDIR ?? '/tmp', 'lapaz-e2e-' ) );
const browser = spawn( chrome, [ '--headless=new', `--remote-debugging-port=${ port }`, `--user-data-dir=${ profile }`, '--hide-scrollbars', '--no-sandbox', 'about:blank' ], { stdio: 'ignore' } );

let failures = 0;
function check( name, ok, detail = '' ) {
	console.log( `${ ok ? '✓' : '✗' } ${ name }${ ok ? '' : ` ${ detail }` }` );
	if ( ! ok ) {
		failures++;
	}
}

async function openPage( url, width ) {
	for ( let i = 0; i < 50; i++ ) {
		try {
			await fetch( `http://127.0.0.1:${ port }/json/version` );
			break;
		} catch {
			await sleep( 200 );
		}
	}
	const tab = await ( await fetch( `http://127.0.0.1:${ port }/json/new?about:blank`, { method: 'PUT' } ) ).json();
	const ws = new WebSocket( tab.webSocketDebuggerUrl );
	const pending = new Map();
	let id = 0;
	ws.onmessage = ( e ) => {
		const m = JSON.parse( e.data );
		pending.get( m.id )?.( m.result );
		pending.delete( m.id );
	};
	await new Promise( ( r ) => ( ws.onopen = r ) );
	const send = ( method, params = {} ) =>
		new Promise( ( r ) => {
			pending.set( ++id, r );
			ws.send( JSON.stringify( { id, method, params } ) );
		} );
	await send( 'Emulation.setDeviceMetricsOverride', { width, height: 700, deviceScaleFactor: 1, mobile: width < 850 } );
	await send( 'Page.enable' );
	await send( 'Page.navigate', { url } );
	await sleep( 2500 );
	const evaluate = async ( expression ) => ( await send( 'Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true } ) ).result.value;
	const key = async ( k ) => {
		await send( 'Input.dispatchKeyEvent', { type: 'keyDown', key: k, code: k } );
		await send( 'Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k } );
		await sleep( 300 );
	};
	// Captura recortada al rectángulo de un elemento.
	const shot = async ( selector ) => {
		const r = await evaluate( `(() => { const b = document.querySelector(${ JSON.stringify( selector ) })?.getBoundingClientRect(); return b && { x: b.x, y: b.y + scrollY, width: b.width, height: b.height }; })()` );
		if ( ! r ) {
			return null;
		}
		const res = await send( 'Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...r, scale: 1 } } );
		return Buffer.from( res.data, 'base64' );
	};
	if ( baselineFrom ) {
		// En Astro dev se quitan la barra de desarrollo y el panel de fuentes de contenido.
		await evaluate( `document.querySelector('astro-dev-toolbar')?.remove(); [...document.querySelectorAll('body > *')].filter(e => e.textContent.trim().startsWith('Fuentes de contenido')).forEach(e => e.remove()); 1` );
	}
	return { evaluate, key, shot, close: () => ws.close() };
}

function compare( name, png ) {
	const file = path.join( baseDir, `${ name }.png` );
	if ( baselineFrom ) {
		fs.mkdirSync( baseDir, { recursive: true } );
		fs.writeFileSync( file, png );
		console.log( `• base guardada: ${ name }` );
		return;
	}
	if ( ! visual ) {
		return;
	}
	if ( ! fs.existsSync( file ) ) {
		check( `visual ${ name }`, false, '(no hay base: correr --baseline)' );
		return;
	}
	const a = PNG.sync.read( fs.readFileSync( file ) );
	const b = PNG.sync.read( png );
	if ( a.width !== b.width || a.height !== b.height ) {
		check( `visual ${ name }`, false, `tamaño ${ b.width }×${ b.height }, base ${ a.width }×${ a.height }` );
		return;
	}
	const diff = pixelmatch( a.data, b.data, null, a.width, a.height, { threshold: 0.1 } );
	const ratio = diff / ( a.width * a.height );
	const ok = ratio < 0.01;
	check( `visual ${ name }`, ok, `(${ ( ratio * 100 ).toFixed( 2 ) }% de píxeles distintos; ver baseline/${ name }.actual.png)` );
	if ( ! ok ) {
		fs.writeFileSync( path.join( baseDir, `${ name }.actual.png` ), png );
	}
}

const t = baselineFrom ? targets.astro : targets.wp;
const base = baselineFrom ?? site;

try {
	// Móvil: header visible, overlay, Esc, foco y cierre al tocar un ancla.
	const m = await openPage( `${ base }/`, 360 );
	compare( 'movil-header', await m.shot( t.header ) );
	if ( ! baselineFrom ) {
		check( 'móvil: el menú de escritorio está oculto', await m.evaluate( `getComputedStyle(document.querySelector('${ t.desktop }')).display === 'none'` ) );
	}
	await m.evaluate( `document.querySelector('${ t.toggle }').click()` );
	await sleep( 400 );
	compare( 'movil-overlay', await m.shot( t.overlay ) );
	if ( ! baselineFrom ) {
		check( 'móvil: la hamburguesa abre el overlay', await m.evaluate( `document.querySelector('${ t.overlay }').classList.contains('${ t.openClass }')` ) );
		check( 'móvil: el foco entra al overlay', await m.evaluate( `document.querySelector('${ t.overlay }').contains(document.activeElement)` ) );
		check( 'móvil: el scroll del body queda bloqueado', await m.evaluate( `getComputedStyle(document.documentElement).overflowY === 'hidden'` ) );
		await m.key( 'Escape' );
		check( 'móvil: Esc cierra el overlay', ! ( await m.evaluate( `document.querySelector('${ t.overlay }').classList.contains('${ t.openClass }')` ) ) );
		check( 'móvil: el foco vuelve a la hamburguesa', await m.evaluate( `document.activeElement === document.querySelector('${ t.toggle }')` ) );
		await m.evaluate( `document.querySelector('${ t.toggle }').click()` );
		await sleep( 300 );
		await m.evaluate( `document.querySelector('${ t.overlay } a[href*="#"]').click()` );
		await sleep( 400 );
		check( 'móvil: tocar un ancla cierra el overlay', ! ( await m.evaluate( `document.querySelector('${ t.overlay }').classList.contains('${ t.openClass }')` ) ) );
	}
	m.close();

	// Escritorio: header oculto, mismo menú que en móvil.
	const d = await openPage( `${ base }/`, 1440 );
	compare( 'escritorio-nav', await d.shot( t.desktop ) );
	if ( ! baselineFrom ) {
		check( 'escritorio: el header móvil está oculto', await d.evaluate( `getComputedStyle(document.querySelector('${ t.header }')).display === 'none'` ) );
		const labels = await d.evaluate( `JSON.stringify([...document.querySelectorAll('${ t.desktop } a')].map(a => a.textContent.trim()))` );
		const mobileLabels = await d.evaluate( `JSON.stringify([...document.querySelectorAll('${ t.overlay } a')].map(a => a.textContent.trim()))` );
		check( 'escritorio: mismos ítems que el menú móvil', labels === mobileLabels && labels !== '[]', `${ labels } ≠ ${ mobileLabels }` );
	}
	d.close();
} finally {
	// Se espera a que Chrome salga antes de borrar su perfil; la limpieza nunca falla la prueba.
	const exited = once( browser, 'exit' );
	browser.kill();
	await Promise.race( [ exited, sleep( 5000 ) ] );
	try {
		fs.rmSync( profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 } );
	} catch {
		console.warn( `No se pudo borrar ${ profile }` );
	}
}

process.exitCode = failures ? 1 : 0;
