import kaboom from "https://kaboomjs.com/lib/0.5.1/kaboom.mjs";

const GROUND_TYPES = ['grass', 'snow'];
const PIPE_COLORS = ['red', 'yellow', 'green', 'blue'];

const CANVAS = document.querySelector('canvas');

/** @type {import('kaboom').KaboomCtx} */
const k = kaboom({
	canvas: CANVAS,
	width: window.innerWidth,
	height: window.innerHeight - 25,
	clearColor: [0, 0, 0, 0.90]
});

const highScore = (() => {
	let highScore = Number(window.localStorage.getItem('high-score') || '0');
	return {
		set: (score) => {
			highScore = score;
			window.localStorage.setItem('high-score', score)
		},
		get: () => highScore
	}
})();

/**
 * Generate random float between two numbers
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
 const randomBetween = (min, max) => Math.random() * (max - min) + min;

/**
	* Choose random element from array
	*
	* @param {any[]} arr
	* @returns {any}
	*/
const randomFrom = arr => arr[Math.floor(randomBetween(0, arr.length))];

k.scene('gameplay', () => {
	k.layers([
		'background',
		'entities',
		'ui'
	], 'entities');

	const score = (() => {
		let score = 0;
		const generateText = () => `${score}/${highScore.get()}`
		const text = k.add([
			k.pos(k.width() / 50, k.height() / 50),
			k.text(generateText(), 32),
			k.layer("ui"),
		]);

		return {
			get: () => score,
			increment: () => {
				score++;
				text.text = generateText();
				if (score > highScore.get()) highScore.set(score);
			}
		}
	})();

	const tiles = (() => {
		const sprite = k.sprite('grass_block_top')
		const width = sprite.width*2
		const height = sprite.height*2
		const columns = k.width() / width;
		const rows = k.height() / height;
		const colPadding = (columns - Math.floor(columns)) * width;
		const rowPadding = (rows - Math.floor(rows)) * height;

		const tiles = {}
		for (let r = 0; r <= Math.floor(columns - 2); r++){
			tiles[r] = {}
			for (let c = 0; c <= Math.floor(rows - 2); c++){
				const tile = k.add([
					k.sprite('grass_block_top'),
					k.pos(colPadding + (r * width) + (width / 2), rowPadding + (c * height) + (height / 2)),
					k.color(121/255, 192/255, 90/255, 1),
					k.scale(2),
					k.layer('background'),
					k.origin('center')
				])
				tiles[r][c] = {
					pos: tile.pos.clone(),
					width: tile.width,
					height: tile.height,
					entity: null,
					row: r,
					col: c
				}
			}
		}

		return tiles
	})();

	(() => {
		const ANGLE_MAP = {
			'LEFT': {
				'DOWN': 0,
				'UP': 3.14/2
			},
			'UP': {
				'LEFT': -3.14/2,
				'RIGHT': 0,
			},
			'RIGHT': {
				'DOWN': -3.14/2,
				'UP': 3.14
			},
			'DOWN': {
				'LEFT': 3.14,
				'RIGHT': 3.14/2
			}
		};
		const DIRECTIONS = {
			'LEFT': k.vec2(0, -1),
			'RIGHT': k.vec2(0, 1),
			'DOWN': k.vec2(1, 0),
			'UP': k.vec2(-1, 0),
		}
		let lastFacing = randomFrom(Object.keys(DIRECTIONS));
		let facing = lastFacing;
		const body = [];

		const addSegment = () => {
			if (DIRECTIONS[lastFacing].add(DIRECTIONS[facing]).eq(k.vec2(0, 0))) {
				facing = lastFacing;
			}
			let last = body.slice(-1)[0]
			while (!last){
				const x = randomFrom(Object.keys(tiles))
				const y = randomFrom(Object.keys(tiles[x]));
				const tile = tiles[x][y];
				if (tile.entity) continue;
				last = tile;
			}
			const offset = DIRECTIONS[facing];
			const row = tiles[last.row + offset.y]
			if (!row) return k.go('gameover', score.get());
			const tile = row[last.col + offset.x]
			if (!tile) return k.go('gameover', score.get());

			const angle = ['RIGHT', 'LEFT'].includes(facing) ? 3.14/2 : 0
			if (last.entity){
				if (facing !== lastFacing){
					last.entity.changeSprite('rail_corner')
					last.entity.angle = ANGLE_MAP[lastFacing][facing]
				}
				else if (!last.entity.is('consumable')){
					last.entity.changeSprite('rail')
				}
			}
			if (tile.entity){
				if (tile.entity.is('consumable') && !tile.entity.consumed) {
					const facingSame = (tile.entity.orientation === 'v' && ['UP', 'DOWN'].includes(facing)) || (tile.entity.orientation === 'h' && ['LEFT', 'RIGHT'].includes(facing));
					if (!facingSame) k.go('gameover', score.get());
					tile.entity.changeSprite('powered_rail_on')
					tile.entity.consumed = true;
					score.increment();
				}
				else {
					k.go('gameover', score.get());
				}
			}
			else{
				tile.entity = k.add([
					k.sprite('detector_rail_on'),
					k.scale(2),
					k.pos(tile.pos),
					k.origin('center'),
					k.rotate(angle)
				]);
			}

			body.push(tile);
			lastFacing = facing;
			if (body.length <= score.get() + 2) return;

			const removing = body.shift();
			k.destroy(removing.entity)
			removing.entity = null;
		}

		k.loop(0.5, () => {
			addSegment();
		})

		Object.keys(DIRECTIONS).forEach(dir => k.keyDown(dir.toLowerCase(), () => {
			const tile = body.slice(-1)[0]
			if (tile.entity.is('consumable')) return;
			facing = dir
		}));
	})();

	(() => {
		let consumable = null;
		const spawnConsumable = () => {
			if (consumable && !consumable.consumed) return;

			let tile = null;
			while(true){
				const x = randomFrom(Object.keys(tiles))
				const y = randomFrom(Object.keys(tiles[x]))
				if (x === '0' || y === '0' || x === Object.keys(tiles).slice(-1)[0] || y === Object.keys(tiles[x]).slice(-1)[0]) continue
				tile = tiles[x][y];
				if (!tile.entity) break;
			}

			const angle = randomFrom([0, 3.14/2, -3.14/2, 3.14]);
			consumable = k.add([
				k.sprite('powered_rail'),
				k.scale(2),
				k.layer('entities'),
				k.origin('center'),
				k.pos(tile.pos),
				k.rotate(angle),
				'consumable',
				{ consumed: false, orientation: Math.floor(Math.abs(angle)) === 1 ? 'h' : 'v' }
			]);
			tile.entity = consumable;
		}
		spawnConsumable();
		k.loop(3, spawnConsumable);
	})();
});

k.scene('gameover', (score) => {
	k.add([
		k.text(`Current Score: ${score.toString().padStart(3, '0')}\nHigh Score   : ${highScore.get().toString().padStart(3, '0')}`, k.width() / 50),
		k.pos(k.width()/2, k.height()/2),
		k.origin('center')
	]);
	k.mouseClick(() => k.go('gameplay'))
	k.keyDown('space', () => k.go('gameplay'))
});


(async () => {
	await Promise.all([
		k.loadSprite('rail', 'assets/rail.png'),
		k.loadSprite('rail_corner', 'assets/rail_corner.png'),
		k.loadSprite('powered_rail_on', 'assets/powered_rail_on.png'),
		k.loadSprite('powered_rail', 'assets/powered_rail.png'),
		k.loadSprite('grass_block_top', 'assets/grass_block_top.png'),
		k.loadSprite('detector_rail_on', 'assets/detector_rail_on.png'),
	]);
	k.start('gameplay');
})().catch(console.error);
