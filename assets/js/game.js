const gameTitle = document.getElementById('game-header-title');
const gameDescription = document.getElementById('game-header-description');
const attemptsText = document.getElementById('attempts-text');
const attemptsNumber = document.getElementById('attempts-number');
const rulesText = document.getElementById('rules-button-text');
const modalContainer = document.getElementById('rules-modal');
const modalContentRules = document.getElementById('modal-content-rules');
const gameShells = document.getElementById('game-center-shells');
const shellModalContainer = document.getElementById('shell-modal');
const gameFooterAttempts = document.getElementById('game-footer-attempts');
const loadingElement = document.getElementById('loading');
const gameContent = document.querySelector('.game-content');

const SAWCanSpin = (game, pointsBalance) => {
	if (game === null || game === undefined) {
		return false;
	}

	switch (game.saw_buyin_type) {
		case 'free': {
			return true;
		}
		case 'spins': {
			return game.spin_count !== null && game.spin_count > 0;
		}
		case 'points': {
			return game.buyin_cost_points <= pointsBalance;
		}
		default: {
			console.warn('Unknown SAW buying type ' + game.saw_buyin_type);
			return true;
		}
	}
};

const SAWPriceText = (game) => {
	if (game === null || game === undefined) {
		return false;
	}
	switch (game.saw_buyin_type) {
		case 'free':
			{
				attemptsText.innerHTML = '';
				attemptsNumber.innerHTML = 'Free';
			}
			break;
		case 'spins': {
			if (canSpin) {
				attemptsText.innerHTML = 'Attempts';
				attemptsNumber.innerHTML = game.spin_count;
			} else {
				attemptsText.innerHTML = game.no_attempts_message + " attempts";
				attemptsNumber.innerHTML = '';
			}
			break;
		}
		case 'points': {
			if (canSpin) {
				attemptsText.innerHTML = 'Points';
				attemptsNumber.innerHTML = playerInfo.ach_points_balance;
			} else {
				attemptsText.innerHTML = game.no_attempts_message + " points";
				attemptsNumber.innerHTML = '';
			}
			break;
		}
		default: {
			attemptsText.innerHTML = 'Unavailable';
			attemptsNumber.innerHTML = '';
			console.warn(`Unknown saw_buyin_type: ${game.saw_buyin_type}`);
			break;
		}
	}
};

const SAWPrizeName = (prize) => {
	if (prize === null || prize === undefined) {
		return false;
	}

	if (prize.prize_type === 'no-prize') {
		return prize.aknowledge_message;
	} else {
		return `${prize.aknowledge_message} ${prize.name}`;
	}
};

let miniGames = [];
let selectedGame = {};
let openRules = false;
let openShell = false;
let playerInfo = {};
let canSpin = false;

const loadMiniGames = async () => {
	if (window._smartico) {
		try {
			loadingElement.style.display = 'flex';
			gameContent.style.display = 'none';

			const games = await window._smartico.api.getMiniGames();
			const userInfo = await window._smartico.getPublicProps();

			miniGames = games;
			playerInfo = userInfo;
			selectedGame = miniGames.find((g) => g.id === 2066);
			canSpin = SAWCanSpin(selectedGame, playerInfo.ach_points_balance);

			if (selectedGame) {
				gameTitle.innerHTML = selectedGame.name;
				gameDescription.innerHTML = selectedGame.promo_text;

				SAWPriceText(selectedGame);

				if (!canSpin) {
					if (gameFooterAttempts && attemptsText) {
						gameFooterAttempts.classList.add('no-attempts');
						attemptsText.classList.add('no-attempts');
					}
				}
				rulesText.innerHTML = 'Check the rules';

				renderGameShells();
			}
		} catch (error) {
			console.error('Error fetching mini-games:', error);
			gameTitle.innerHTML = 'Error loading name!';
			gameDescription.innerHTML = 'Error loading description';
			attemptsText.innerHTML = '';
			attemptsNumber.innerHTML = '';
			rulesText.innerHTML = '';
		} finally {
			loadingElement.style.display = 'none';
			gameContent.style.display = 'flex';
		}
	}
};

const handleOpenRules = () => {
	openRules = true;
	renderModalRules();
};

const handleCloseRules = () => {
	openRules = false;
	modalContainer.innerHTML = '';
};

const renderModalRules = () => {
	if (!openRules && !modalContainer) {
		modalContainer.innerHTML = '';
		return;
	}

	modalContainer.innerHTML = `
        <div class="modal-wrapper ${openRules ? 'active' : ''}">
            <div class="modal-content">
                <div class="modal-content-text">
                    <div class="modal-content-title" id="modal-content-title">Terms & Conditions</div>
                    <div class="modal-content-rules" id="modal-content-rules">
                    </div>
                </div>
                <div class="modal-content-button" onclick="handleCloseRules();">
                    <div class="modal-content-button-text" id="back-button-text"></div>
                </div>
            </div>
        </div>
    `;
	const modalContentRules = document.getElementById('modal-content-rules');
	const backText = document.getElementById('back-button-text');

	if (modalContentRules && backText) {
		modalContentRules.innerHTML = selectedGame.description;
		backText.innerHTML = 'Back to game';
	}
};

const renderGameShells = () => {
	gameShells.innerHTML = '';

	for (let i = 0; i <= 15; i++) {
		const shell = document.createElement('div');
		shell.id = `shell-${i}`;
		shell.className = `game-shell ${!canSpin ? 'disabled' : ''}`;
		shell.onclick = async () => {
			if (canSpin) {
				try {
					const { prize_id } = await _smartico.api.playMiniGame(selectedGame.id);
					const prize = selectedGame.prizes.find((p) => p.id === prize_id);
					handleOpenShell(prize);
					await updateSpinCount();
					
					renderGameShells();
					SAWPriceText(selectedGame);

					if (!canSpin && gameFooterAttempts && attemptsText) {
						gameFooterAttempts.classList.add('no-attempts');
						attemptsText.classList.add('no-attempts');
					}
				} catch (error) {
					console.error('Error playing mini-game:', error);
				}
			}
		};

		gameShells.appendChild(shell);
	}
};

const handleOpenShell = (prize) => {
	openShell = true;
	renderShellModal(prize);
};

const handleCloseShell = () => {
	openShell = false;
	_smartico.dp(selectedGame.prizes[0].acknowledge_dp);
	shellModalContainer.innerHTML = '';
};

const renderShellModal = (prize) => {
	if (openShell && shellModalContainer) {
		shellModalContainer.innerHTML = `
            <div class="modal-shell-wrapper active">
                <div class="modal-animated-shell">
                    <div class="game-shell-animated" id="game-shell-animated"></div>
                </div>
                <div class="modal-shell-content hidden">
                    <div class="shell-image">
                        <div class="shell-prize">
                            <img src="${prize?.icon}" class="shell-prize-img"></img>
                            <div class="sparkles" id="sparkles"></div>
                        </div>
                    </div>
                    <div class="shell-message">
                        ${SAWPrizeName(prize)}
                    </div>
                    <div class="shell-button" onclick="handleCloseShell();">
                        <div class="shell-button-text">${prize?.acknowledge_action_title}</div>
                    </div>
                </div>
            </div>
        `;

		const animatedShell = document.getElementById(`game-shell-animated`);
		setTimeout(() => {
			animatedShell.style.display = 'none';
			document.querySelector('.modal-shell-content').classList.remove('hidden');
			document.querySelector('.modal-shell-content').classList.add('show-prize');
			document.querySelector('.modal-animated-shell').classList.add('hidden');
			const updatedUserInfo = window._smartico.getPublicProps();
			if (selectedGame.saw_buyin_type === 'points') {
				attemptsNumber.innerHTML = updatedUserInfo.ach_points_balance;
			}
		}, 2500);
	} else {
		shellModalContainer.innerHTML = '';
	}

	startSparkles();
};

const updateSpinCount = async () => {
	const games = await window._smartico.api.getMiniGames();
	const userInfo = await window._smartico.getPublicProps();
	const updatedGame = games.find((g) => g.id === selectedGame.id);
	canSpin = SAWCanSpin(updatedGame, userInfo.ach_points_balance);

	if (updatedGame) {
		if (updatedGame.saw_buyin_type === 'spins') {
			selectedGame.spin_count = updatedGame.spin_count;
			attemptsNumber.innerHTML = selectedGame.spin_count;
		}
		if (updatedGame.saw_buyin_type === 'points') {
			const newBalance = userInfo.ach_points_balance - updatedGame.buyin_cost_points;
			attemptsNumber.innerHTML = newBalance;

			if (newBalance < 0) {
				console.error('Not enough points to play the game.');
				attemptsText.innerHTML = 'Not enough points to play';
				attemptsNumber.innerHTML = '';
				return;
			}
		}
	}
};

const startSparkles = () => {
	const sparkleContainer = document.getElementById('sparkles');

	const createSparkle = () => {
		const sparkle = document.createElement('div');
		sparkle.className = 'sparkle';

		const size = Math.random() * 5 + 2;
		sparkle.style.width = `${size}px`;
		sparkle.style.height = `${size}px`;

		sparkle.style.top = `${Math.random() * 100}%`;
		sparkle.style.left = `${Math.random() * 100}%`;

		sparkleContainer.appendChild(sparkle);

		setTimeout(() => {
			sparkle.remove();
		}, 1000);
	};

	setInterval(createSparkle, 300);
};

const initializeGame = () => {
	loadMiniGames();
};
