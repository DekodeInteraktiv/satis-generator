/**
 * External dependencies
 */
const { isEmpty } = require( 'lodash' );
const fs = require( 'fs' );
const git = require( 'simple-git/promise' )();
const glob = require( 'fast-glob' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const readConfig = require( './config' );
const { asyncForEach, getComposerConfig } = require( './utils' );

async function detectChangedPackages() {
	const { packages } = await readConfig();
	let packageDirs = await glob( packages, { onlyDirectories: true } );

	// Only include directories that contains a composer.json file.
	packageDirs = packageDirs.filter( ( dir ) => (
		fs.existsSync( path.resolve( dir, 'composer.json' ) )
	) );

	const tags = await git.tags();

	const changedPackages = [];
	await asyncForEach( packageDirs, async ( dir ) => {
		const composer = await getComposerConfig( dir );
		const { name, version } = composer;
		const tagName = `${ name }@${ version }`;

		// If tag dosn't exits we assume the package has never been released and
		// are changed.
		if ( ! tags.all.includes( tagName ) ) {
			changedPackages.push( dir );
		} else {
			const diff = await git.diff( [ 'HEAD', tagName, '--', dir ] );
			if ( ! isEmpty( diff ) ) {
				changedPackages.push( dir );
			}
		}
	} );

	return changedPackages;
}

module.exports = detectChangedPackages;
