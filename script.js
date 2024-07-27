document.addEventListener('DOMContentLoaded', (event) => {
    let deck, dealerHand, dealerScore, bankroll = 1000, currentBet;
    let players = [];
    let numPlayers = 0;
    let currentPlayerIndex = 0;
    const usernameForm = document.getElementById('username-form');
    const usernameInput = document.getElementById('username');
    const playerList = document.getElementById('player-list');
    const startGameButton = document.getElementById('start-game');
    const waitingRoom = document.getElementById('waiting-room');
    const gameContainer = document.getElementById('game');
    
    // Player registration
    usernameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let username = usernameInput.value.trim();
        if (username && !players.some(player => player.username === username)) {
            players.push({ username, hand: [], score: 0, bet: 0 });
            numPlayers = players.length;
            updatePlayerList();
            usernameInput.value = '';
            if (numPlayers > 1) {
                startGameButton.disabled = false;
            }
        }
    });

    function updatePlayerList() {
        playerList.innerHTML = players.map(player => `<li>${player.username}</li>`).join('');
    }

    startGameButton.addEventListener('click', () => {
        waitingRoom.style.display = 'none';
        gameContainer.style.display = 'block';
        startGame();
    });

    function createDeck() {
        let suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        let values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        let deck = [];
        for (let suit of suits) {
            for (let value of values) {
                deck.push({ value, suit });
            }
        }
        return deck;
    }

    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    function getCardValue(card) {
        if (['J', 'Q', 'K'].includes(card.value)) {
            return 10;
        } else if (card.value === 'A') {
            return 11;
        } else {
            return parseInt(card.value);
        }
    }

    function calculateHandValue(hand) {
        let value = 0;
        let aceCount = 0;
        for (let card of hand) {
            value += getCardValue(card);
            if (card.value === 'A') {
                aceCount++;
            }
        }
        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }
        return value;
    }

    function setupPlayers() {
        const playersContainer = document.getElementById('players');
        playersContainer.innerHTML = ''; // Clear existing players

        for (let i = 0; i < numPlayers; i++) {
            players[i].hand = [];
            players[i].score = 0;

            const playerDiv = document.createElement('div');
            playerDiv.classList.add('player');
            playerDiv.id = `player-${i}`;
            playerDiv.innerHTML = `
                <h2>${players[i].username}</h2>
                <div class="hand" id="player-${i}-cards"></div>
                <div id="player-${i}-score"></div>
            `;
            playersContainer.appendChild(playerDiv);
        }
    }

    function dealInitialCards() {
        dealerHand = [deck.pop(), deck.pop()];
        for (let i = 0; i < numPlayers; i++) {
            players[i].hand = [deck.pop(), deck.pop()];
            players[i].score = calculateHandValue(players[i].hand);
        }
        dealerScore = calculateHandValue(dealerHand);
        updateUI();
    }

    function updateUI() {
        for (let i = 0; i < numPlayers; i++) {
            document.getElementById(`player-${i}-cards`).innerHTML = players[i].hand.map(card => `<div class="card" style="background-image: url('${getCardImage(card)}');"></div>`).join('');
            document.getElementById(`player-${i}-score`).innerText = `Score: ${players[i].score}`;
        }
        document.getElementById('dealer-cards').innerHTML = dealerHand.map(card => `<div class="card" style="background-image: url('${getCardImage(card)}');"></div>`).join('');
        document.getElementById('dealer-score').innerText = `Score: ${dealerScore}`;
        document.getElementById('bankroll').innerText = `Bankroll: $${bankroll}`;
        document.getElementById('status').innerText = `Player ${currentPlayerIndex + 1}'s Turn`;
    }

    function getCardImage(card) {
        return `images/cards/${card.value}_of_${card.suit}.png`;
    }

    function checkForEndOfGame() {
        let allPlayersDone = players.every(player => player.hand.length > 0 && calculateHandValue(player.hand) >= 21);
        if (allPlayersDone) {
            while (dealerScore < 17) {
                dealerHand.push(deck.pop());
                dealerScore = calculateHandValue(dealerHand);
            }
            updateUI();
            for (let i = 0; i < numPlayers; i++) {
                if (players[i].score > 21) {
                    document.getElementById('status').innerText += ` Player ${i + 1} busts!`;
                    bankroll -= currentBet;
                } else if (dealerScore > 21 || players[i].score > dealerScore) {
                    document.getElementById('status').innerText += ` Player ${i + 1} wins!`;
                    bankroll += currentBet;
                } else {
                    document.getElementById('status').innerText += ` Dealer wins against Player ${i + 1}.`;
                    bankroll -= currentBet;
                }
            }
            document.getElementById('btn-hit').disabled = true;
            document.getElementById('btn-stand').disabled = true;
            document.getElementById('btn-deal').disabled = false;
        } else {
            currentPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
            updateUI();
        }
    }

    function startGame() {
        deck = shuffleDeck(createDeck());
        setupPlayers();
        dealInitialCards();
        document.getElementById('btn-hit').disabled = false;
        document.getElementById('btn-stand').disabled = false;
        document.getElementById('btn-deal').disabled = true;
    }

    document.getElementById('btn-deal').addEventListener('click', () => {
        currentBet = parseInt(document.getElementById('bet-amount').value);
        if (currentBet > bankroll) {
            document.getElementById('status').innerText = 'Insufficient funds!';
            return;
        }
        deck = shuffleDeck(createDeck());
        setupPlayers();
        dealInitialCards();
        document.getElementById('status').innerText = '';
        document.getElementById('btn-hit').disabled = false;
        document.getElementById('btn-stand').disabled = false;
        document.getElementById('btn-deal').disabled = true;
    });

    document.getElementById('btn-hit').addEventListener('click', () => {
        if (players[currentPlayerIndex].hand.length > 0) {
            players[currentPlayerIndex].hand.push(deck.pop());
            players[currentPlayerIndex].score = calculateHandValue(players[currentPlayerIndex].hand);
            updateUI();
            checkForEndOfGame();
        }
    });

    document.getElementById('btn-stand').addEventListener('click', () => {
        checkForEndOfGame();
    });
});
