/**
 * External dependencies
 */
const log = require('npmlog');
const glob = require('fast-glob');
const path = require('path');
const fs = require('fs');

/**
 * Internal dependencies
 */
const { hasArgInCLI } = require('../lib/cli-utils');
const { registerPlugins } = require('../lib/plugins.js');
const checkWorkingTree = require('../lib/check-working-tree');
const commit = require('../lib/commit');
const detectChangedPackages = require('../lib/detect-changed-packages');
const { promptPackageVersions, promptVersion } = require('../lib/prompt');
const updatePackages = require('../lib/update-packages');
const updateSatis = require('../lib/update-satis');
const readConfig = require('../lib/config');

async function publish() {
	await registerPlugins();
	await checkWorkingTree();

	let pkgs, pkgsToPublish;
	const { packages, version } = await readConfig();

	if ( version === 'independent' ) {
		pkgs = await detectChangedPackages();

		// If no packages is changed, inform user and die.
		if (pkgs.length === 0) {
			log.info('', 'No changed packages to publish');
			process.exit(0);
		}

		pkgsToPublish = await promptPackageVersions(pkgs);
	} else {
		pkgs = await glob(packages, { onlyDirectories: true });

		// Only include directories that contains a composer.json file.
		pkgs = pkgs.filter((dir) =>
			fs.existsSync(path.resolve(dir, 'composer.json')),
		);

		pkgsToPublish = await promptVersion(pkgs);
	}

	await updatePackages(pkgsToPublish);
	await updateSatis(pkgsToPublish);

	if (!hasArgInCLI('--dry-run')) {
		await commit(pkgsToPublish);
	}
}

publish();
