/**
 * External dependencies
 */
const { get } = require( 'lodash' );
const fs = require( 'fs' );
const git = require( 'simple-git' )();
const glob = require( 'fast-glob' );
const JSZip = require( 'jszip' );
const log = require( 'npmlog' );
const makeDir = require( 'make-dir' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const readConfig = require( '../lib/config' );
const { getComposerConfig, asyncForEach, zipName } = require( '../lib/utils' );

/**
 * Absolute path to zips directory.
 *
 * @type {string}
 */
const ZIPS_DIR = path.resolve( process.cwd(), 'satis-generator-zips' );

async function zipPackages() {
	// Create zips folder.
	makeDir( ZIPS_DIR );

	const { packages } = await readConfig();
	const packageDirs = await glob( packages, { onlyDirectories: true } );

	const tags = await git.tag( [ '--points-at', 'HEAD' ] );

	const zipDirs = [];

	await asyncForEach( packageDirs, async ( pkg ) => {
		if ( fs.existsSync( path.resolve( pkg, 'composer.json' ) ) ) {
			const composer = await getComposerConfig( pkg );
			const { name, version } = composer;

			if ( tags.indexOf( `${ name }@${ version }` ) !== -1 ) {
				zipDirs.push( {
					dir: pkg,
					name,
					version,
					ignore: get( composer, 'archive.exclude', [] ),
				} );
			}
		}
	} );

	if ( zipDirs.length === 0 ) {
		log.info( '', 'No released packages in this commit. Skipping zip.' );
		process.exit( 0 );
	}

	await asyncForEach( zipDirs, async ( {
		dir,
		ignore,
		name,
		version,
	} ) => {
		const zip = new JSZip();
		const filename = zipName( name, version );

		const pattern = [ '**' ];

		/*
		 * Add ignores to pattern because ignore option don't work with the
		 * syntax composer uses in exclude.
		 */
		ignore.forEach( ( p ) => {
			let isNegative = true;

			if ( p.startsWith( '!' ) ) {
				isNegative = false;
				p = p.substring( 1 );
			}

			if ( p.startsWith( '/' ) ) {
				p = p.substring( 1 );
			}

			if ( isNegative ) {
				p = `!${ p }`;
			}

			pattern.push( p );
		} );

		const files = await glob( pattern, {
			onlyFiles: true,
			cwd: path.resolve( process.cwd(), dir ),
			dot: true,
		} );

		files.forEach( ( file ) => {
			const filePath = path.resolve( process.cwd(), dir, file );
			const stats = fs.statSync( filePath );
			const data = fs.readFileSync( filePath );

			zip.file( file, data, {
				mode: stats.mode,
				date: new Date( stats.mtime ),
				compression: 'DEFLATE',
				compressionOptions: {
					level: 6,
				},
			} );
		} );

		zip
			.generateNodeStream( { type: 'nodebuffer', streamFiles: true } )
			.pipe( fs.createWriteStream( path.resolve( ZIPS_DIR, filename ) ) )
			.on( 'finish', () => {
				// JSZip generates a readable stream with a "end" event,
				// but is piped here in a writable stream which emits a "finish" event.
				log.info( 'ZIP', `${ filename } written.` );
			} );
	} );
}

zipPackages();
