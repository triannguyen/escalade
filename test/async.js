import { test } from 'uvu';
import { join, resolve } from 'path';
import * as assert from 'uvu/assert';
import escalade from '../src/async';

const fixtures = join(__dirname, 'fixtures');

test('should export a function', () => {
	assert.type(escalade, 'function');
});

test('should convert relative output into absolute', async () => {
	let output = await escalade(fixtures, () => 'foobar.js');
	assert.is(output, join(fixtures, 'foobar.js'));
});

test('should respect absolute output', async () => {
	let foobar = resolve('.', 'foobar.js');
	let output = await escalade(fixtures, () => foobar);
	assert.is(output, foobar);
});

test('should receive directory names in contents list', async () => {
	let levels = 0;
	let output = await escalade(fixtures, (dir, files) => {
		levels++;
		return files.includes('fixtures') && 'fixtures';
	});

	assert.is(levels, 2);
	assert.is(output, fixtures);
});

test('should terminate walker immediately', async () => {
	let levels = 0;
	let output = await escalade(fixtures, () => `${++levels}.js`);

	assert.is(levels, 1);
	assert.is(output, join(fixtures, '1.js'));
});

test('should end after `process.cwd()` read', async () => {
	let levels = 0;
	let output = await escalade(fixtures, (dir, files) => {
		levels++;
		if (files.includes('package.json')) {
			return join(dir, 'package.json');
		}
	});

	assert.is(levels, 3);
	assert.is(output, resolve('.', 'package.json'))
});

test.run();