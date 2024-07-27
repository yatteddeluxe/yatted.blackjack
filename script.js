let deck, playerHand, dealerHand, playerScore, dealerScore, bankroll = 1000, currentBet;

function createDeck() {
    let suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
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

function updateUI() {
    document.getElementById('player-cards').innerHTML = playerHand.map(card => `<div class="card">${card.value} ${card.suit}</div>`).join('');
    document.getElementById('dealer-cards').innerHTML = dealerHand.map(card => `<div class="card">${card.value} ${card.suit}</div>`).join('');
    document.getElementById('player-score').innerText = `Score: ${playerScore}`;
    document.getElementById('dealer-score').innerText = `Score: ${dealerScore}`;
    document.getElementById('bankroll').innerText = `Bankroll: $${bankroll}`;
    console.log("UI Updated");
}

function checkForEndOfGame() {
    console.log("Checking for end of game");
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
    console.log("End of game");
    document.getElementById('btn-hit').disabled = true;
    document.getElementById('btn-stand').disabled = true;
    document.getElementById('btn-deal').disabled = false;
    updateUI();
}

document.getElementById('btn-deal').addEventListener('click', () => {
    console.log("Deal button clicked");
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
    console.log("Hit button clicked");
    playerHand.push(deck.pop());
    updateScores();
    updateUI();
    checkForEndOfGame();
});

document.getElementById('btn-stand').addEventListener('click', () => {
    console.log("Stand button clicked");
    while (dealerScore < 17) {
        dealerHand.push(deck.pop());
        updateScores();
        updateUI();
    }
    checkForEndOfGame();
});
