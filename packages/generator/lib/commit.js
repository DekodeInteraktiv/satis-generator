/**
 * External dependencies
 */
const git = require( 'simple-git' )();

/**
 * Internal dependencies
 */
const { asyncForEach } = require( './utils' );
const readConfig = require( './config' );

async function commit( pkgs ) {
	const { publishMessage, branch } = await readConfig();
	await git.add( '.' );
	await git.commit( `${ publishMessage }\n${ pkgs.map( ( { name, version } ) => `- ${ name }@${ version }` ).join( '\n' ) }` );

	await asyncForEach( pkgs, async ( pkg ) => {
		const { name, version } = pkg;
		git.addTag( `${ name }@${ version }` );
	} );

	await git.push( 'origin', branch, [ '--follow-tags', '--no-verify' ] );
}

module.exports = commit;
