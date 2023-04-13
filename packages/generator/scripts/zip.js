/**
 * External dependencies
 */
const { get } = require('lodash');
const debug = require('debug')('generator');
const fs = require('fs');
const git = require('simple-git')();
const glob = require('fast-glob');
const JSZip = require('jszip');
const log = require('npmlog');
const makeDir = require('make-dir');
const path = require('path');

/**
 * Internal dependencies
 */
const readConfig = require('../lib/config');
const { registerPlugins, updateZipName } = require('../lib/plugins');
const { getComposerConfig, asyncForEach, zipName } = require('../lib/utils');

/**
 * Absolute path to zips directory.
 *
 * @type {string}
 */
const ZIPS_DIR = path.resolve(process.cwd(), 'satis-generator-zips');

async function zipPackages() {
	await registerPlugins();

	// Create zips folder.
	makeDir(ZIPS_DIR);

	const { packages, version: configVersion } = await readConfig();
	const packageDirs = await glob(packages, { onlyDirectories: true });

	const zipDirs = [];
	let tags = [];

	if (configVersion === 'independent') {
		log.info('', 'Fetching tags');
		await git.fetch({ '--tags': true });
		const tags = await git.tag(['--points-at', 'HEAD']);

		debug('tags found', tags);
	}

	await asyncForEach(packageDirs, async (pkg) => {
		if (fs.existsSync(path.resolve(pkg, 'composer.json'))) {
			const composer = await getComposerConfig(pkg);
			const { name, version } = composer;

			if (
				configVersion !== 'independent' ||
				tags.indexOf(`${name}@${version}`) !== -1
			) {
				zipDirs.push({
					dir: pkg,
					name,
					version,
					ignore: get(composer, 'archive.exclude', []),
				});
			} else {
				debug('skipping package', name);
			}
		}
	});

	if (zipDirs.length === 0) {
		log.info('', 'No released packages in this commit. Skipping zip.');
		process.exit(0);
	}

	await asyncForEach(zipDirs, async ({ dir, ignore, name, version }) => {
		const zip = new JSZip();
		let filename = zipName(name, version);

		if (updateZipName.length !== 0) {
			await asyncForEach(updateZipName, async (fn) => {
				filename = await fn(filename);
			});
		}

		const pattern = ['**'];

		/*
		 * Add ignores to pattern because ignore option don't work with the
		 * syntax composer uses in exclude.
		 */
		ignore.forEach((p) => {
			let isNegative = true;

			if (p.startsWith('!')) {
				isNegative = false;
				p = p.substring(1);
			}

			if (p.startsWith('/')) {
				p = p.substring(1);
			}

			if (isNegative) {
				p = `!${p}`;
			}

			pattern.push(p);
		});

		const files = await glob(pattern, {
			onlyFiles: true,
			cwd: path.resolve(process.cwd(), dir),
			dot: true,
		});

		files.forEach((file) => {
			const filePath = path.resolve(process.cwd(), dir, file);
			const stats = fs.statSync(filePath);
			const data = fs.readFileSync(filePath);

			zip.file(file, data, {
				mode: stats.mode,
				date: new Date(stats.mtime),
				compression: 'DEFLATE',
				compressionOptions: {
					level: 6,
				},
			});
		});

		zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
			.pipe(fs.createWriteStream(path.resolve(ZIPS_DIR, filename)))
			.on('finish', () => {
				// JSZip generates a readable stream with a "end" event,
				// but is piped here in a writable stream which emits a "finish" event.
				log.info('ZIP', `${filename} written.`);
			});
	});
}

zipPackages();
