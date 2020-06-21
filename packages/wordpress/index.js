/**
 * External dependencies
 */
const { existsSync } = require( 'fs' );
const replace = require( 'replace-in-file' );
const path = require( 'path' );
const fs = require( 'fs' );

module.exports = {
	updatePackage: async ( {
		pkg,
		type,
		from,
		to,
	} ) => {
		if ( type === 'wordpress-plugin' ) {
			await replace( {
				files: path.resolve( pkg, '*.php' ),
				from: ( file ) => {
					const content = fs.readFileSync( file, 'utf8' );

					if ( /Plugin Name:/i.test( content ) ) {
						return new RegExp( `version:\\s+(${ from })`, 'i' );
					}

					return false;
				},
				to: ( match ) => match.replace( from, to ),
			} );
		}

		if ( type === 'wordpress-theme' ) {
			const stylePath = path.resolve( pkg, 'style.css' );

			if ( existsSync( stylePath ) ) {
				await replace( {
					files: stylePath,
					from: new RegExp( `version:\\s+(${ from })`, 'i' ),
					to: ( match ) => match.replace( from, to ),
				} );
			}
		}
	},
};
