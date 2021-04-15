function Stats() {
	statStr = [
		'health',
		'mana',
		'attack',
		'defence',
		'spclAttack',
		'spclDefence',
	];

	stat = [];

	for (let i = 0; i < statStr.length; i++) {
		stat.push(document.getElementById(statStr[i]));
	}

	skillpts = +document.getElementById('skillpoints').textContent;

	document.getElementById('skillpoints').textContent = skillpts;

	for (let i = 0, eleUp = null; i < 2; i++) {
		eleUp = document.getElementById(`${statStr[i]}-up-stat-btn`);
		eleUp.addEventListener('click', () => {
			if (skillpts > 0) {
				stat[i].value = +stat[i].value + 20;
				skillpts -= 1;
				document.getElementById('skillpoints').textContent = skillpts;
			}
		});

		const eleDn = document.getElementById(`${statStr[i]}-down-stat-btn`);
		eleDn.addEventListener('click', () => {
			if (+stat[i].value > 0 && +stat[i].value > 20) {
				stat[i].value = +stat[i].value - 20;
				skillpts += 1;
				document.getElementById('skillpoints').textContent = skillpts;
			}
		});
	}

	for (let i = 2, eleUp = null; i < statStr.length; i++) {
		eleUp = document.getElementById(`${statStr[i]}-up-stat-btn`);
		eleUp.addEventListener('click', () => {
			if (skillpts > 0) {
				stat[i].value = +stat[i].value + 1;
				skillpts -= 1;
				document.getElementById('skillpoints').textContent = skillpts;
			}
		});

		const eleDn = document.getElementById(`${statStr[i]}-down-stat-btn`);
		eleDn.addEventListener('click', () => {
			if (+stat[i].value > 0 && +stat[i].value > 1) {
				stat[i].value = +stat[i].value - 1;
				skillpts += 1;
				document.getElementById('skillpoints').textContent = skillpts;
			}
		});
	}
}
function err() {
	if (window.location.search) {
		const error = document.getElementById('error-message');
		error.textContent = window.location.search
			.split('%22')[1]
			.replaceAll('%20', ' ');
		error.classList.remove('hidden');
	}
}
// ALL MAPS FOR GAME AND RANDOM GENERATING FUNCTION FOR MAPS
const maps = [
	'/assets/arenas/africa.gif',
	'/assets/arenas/aquarium.gif',
	'/assets/arenas/asia.gif',
	'/assets/arenas/atlantis.gif',
	'/assets/arenas/blockade.gif',
	'/assets/arenas/burnt-down-village.gif',
	'/assets/arenas/china-dark.gif',
	'/assets/arenas/china-light.gif',
	'/assets/arenas/city.gif',
	'/assets/arenas/cliff-side-dark.gif',
	'/assets/arenas/cliff-side.gif',
	'/assets/arenas/corner.gif',
	'/assets/arenas/country-side.gif',
	'/assets/arenas/desert.gif',
	'/assets/arenas/final-arena.gif',
	'/assets/arenas/foggy-forest-cabin.gif',
	'/assets/arenas/fortune-teller.gif',
	'/assets/arenas/gotta-go.gif',
	'/assets/arenas/gym.gif',
	'/assets/arenas/hollywood.gif',
	'/assets/arenas/holy-temple.gif',
	'/assets/arenas/leaf-village.gif',
	'/assets/arenas/market.gif',
	'/assets/arenas/meadow.gif',
	'/assets/arenas/monastery.gif',
	'/assets/arenas/old-school.gif',
	'/assets/arenas/peaceful.gif',
	'/assets/arenas/peru.gif',
	'/assets/arenas/pier.gif',
	'/assets/arenas/race-track.gif',
	'/assets/arenas/sewers.gif',
	'/assets/arenas/ship.gif',
	'/assets/arenas/snowy-place.gif',
	'/assets/arenas/spirit-world.gif',
	'/assets/arenas/stream.gif',
	'/assets/arenas/temple-of-doom.gif',
	'/assets/arenas/tokyo.gif',
	'/assets/arenas/train-station.gif',
	'/assets/arenas/truck-stop.gif',
	'/assets/arenas/urinal.gif',
	'/assets/arenas/village.gif',
	'/assets/arenas/windmill.gif',
];

function getRand(max, min) {
	let num = Math.random() * (max + 1 - min) + min - 1;
	num = Math.ceil(num);
	return num;
}
function backg() {
	let mapChoice = maps[getRand(maps.length - 1, 0)];
	const backg = document.querySelector('.game-window');
	backg.setAttribute('Style', `background-image: url(${mapChoice});`);
}

function combine() {
	Stats();
	err();
}
