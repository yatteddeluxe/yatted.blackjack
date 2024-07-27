document.addEventListener('DOMContentLoaded', (event) => {
    let deck, playerHand, dealerHand, playerScore, dealerScore, bankroll = 1000, currentBet;

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

    function dealInitialCards() {
        playerHand = [deck.pop(), deck.pop()];
        dealerHand = [deck.pop(), deck.pop()];
        updateScores();
        updateUI();
    }

    function updateScores() {
        playerScore = calculateHandValue(playerHand);
        dealerScore = calculateHandValue(dealerHand);
    }

    function getCardImage(card) {
        return `images/cards/${card.value}_of_${card.suit}.png`;
    }

    function updateUI() {
        document.getElementById('player-cards').innerHTML = playerHand.map(card => `<div class="card" style="background-image: url('${getCardImage(card)}');"></div>`).join('');
        document.getElementById('dealer-cards').innerHTML = dealerHand.map(card => `<div class="card" style="background-image: url('${getCardImage(card)}');"></div>`).join('');
        document.getElementById('player-score').innerText = `Score: ${playerScore}`;
        document.getElementById('dealer-score').innerText = `Score: ${dealerScore}`;
        document.getElementById('bankroll').innerText = `Bankroll: $${bankroll}`;
    }

    function checkForEndOfGame() {
        if (playerScore > 21) {
            document.getElementById('status').innerText = 'Player busts! Dealer wins.';
            bankroll -= currentBet;
            endGame();
        } else if (dealerScore > 21) {
            document.getElementById('status').innerText = 'Dealer busts! Player wins.';
            bankroll += currentBet;
            endGame();
        } else if (playerScore === 21) {
            document.getElementById('status').innerText = 'Player hits Blackjack! Player wins.';
            bankroll += currentBet;
            endGame();
        } else if (dealerScore === 21) {
            document.getElementById('status').innerText = 'Dealer hits Blackjack! Dealer wins.';
            bankroll -= currentBet;
            endGame();
        } else if (dealerScore >= 17 && dealerScore >= playerScore) {
            document.getElementById('status').innerText = 'Dealer wins.';
            bankroll -= currentBet;
            endGame();
        } else if (dealerScore >= 17 && dealerScore < playerScore) {
            document.getElementById('status').innerText = 'Player wins.';
            bankroll += currentBet;
            endGame();
        }
    }

    function endGame() {
        document.getElementById('btn-hit').disabled = true;
        document.getElementById('btn-stand').disabled = true;
        document.getElementById('btn-deal').disabled = false;
        updateUI();
    }

    document.getElementById('btn-deal').addEventListener('click', () => {
        currentBet = parseInt(document.getElementById('bet-amount').value);
        if (currentBet > bankroll) {
            document.getElementById('status').innerText = 'Insufficient funds!';
            return;
        }
        deck = shuffleDeck(createDeck());
        dealInitialCards();
        document.getElementById('status').innerText = '';
        document.getElementById('btn-hit').disabled = false;
        document.getElementById('btn-stand').disabled = false;
        document.getElementById('btn-deal').disabled = true;
    });

    document.getElementById('btn-hit').addEventListener('click', () => {
        playerHand.push(deck.pop());
        updateScores();
        updateUI();
        checkForEndOfGame();
    });

    document.getElementById('btn-stand').addEventListener('click', () => {
        while (dealerScore < 17) {
            dealerHand.push(deck.pop());
            updateScores();
            updateUI();
        }
        checkForEndOfGame();
    });
});
