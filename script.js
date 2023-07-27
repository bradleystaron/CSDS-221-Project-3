/* 
 Additional behaviors that could be added below:
 TODO: Implement Doubling down
 TODO: Implement Bet Max Button/All in
 TODO: Implement Key/Button Press Instructions for the player
 TODO: Implement chips for betting
 
*/

// Global variables for the start of the game

let playerCards = [];
let dealerCards = [];
let deck = [];

let currentCardsPlayer = 0;
let currentCardsDealer = 0;

// User starts with $100
let bank = 100;
let bet = 0;
let betMemo = 0;
const prizeMult = 2;
const blackjackPrizeMult = 3;

let gameStarted = false;
let playerTurn = false;
let dealerTurn = false;
let phase = "";

// Timeout for the game to end from inactivity
let cardTimeout = 800;
let bigSignTimeout = 800;
let cardDealingTimeout = 200;

let keyboardTipCount = 0;
let blackjackTipCount = 0;

// Utility Functions

// Debounce functions
function debounce(fn, delay) {
  var timer = null;
  return function () {
    var context = this,
      args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}
document.addEventListener("contextmenu", (event) => event.preventDefault());

//Game Functions

// Creating the deck of 52 cards
// Creates the class of each card with the card's rank and suit
class Card {
  constructor(number, suit, value) {
    this._number = number;
    this._suit = suit;
    this._value = value;
  }

  get number() {
    return this._number;
  }

  get suit() {
    return this._suit;
  }

  get value() {
    return this._value;
  }
}

function createDeck() {
  deck = [];

  function createDeck(suit) {
    function createAce(suit) {
      let cardWord = "card";
      let cardNumber = 1;
      let card = cardWord + cardNumber;
      card = new Card("A", suit, 11);
      deck.push(card);
    }

    function createFacedCards(suit) {
      let card = "card" + 11;
      card = new Card("J", suit, 10);
      deck.push(card);
      card = "card" + 12;
      card = new Card("Q", suit, 10);
      deck.push(card);
      card = "card" + 13;
      card = new Card("K", suit, 10);
      deck.push(card);
    }

    function createRegularCards(suit) {
      for (let i = 2; i <= 10; i++) {
        let cardWord = "card";
        let cardNumber = i;
        let card = cardWord + cardNumber;
        card = new Card(i, suit, i);
        deck.push(card);
      }
    }

    createAce(suit);
    createRegularCards(suit);
    createFacedCards(suit);
  }
  // Creates card suits
  createDeck("hearts");
  createDeck("diamonds");
  createDeck("spades");
  createDeck("clubs");
}

/// Deals a random card
function randomCard() {
  let selectedCard = Math.round(Math.random() * (deck.length - 1));
  let dealedCard = deck[selectedCard];
  deck.splice(selectedCard, 1);
  return dealedCard;
}

// Calculate the total sum of values for the cards belonging to a single player
function totalValue(player) {
  let result = 0;
  for (i = 0; i < player.length; i++) {
    result += player[i].value;
  }
  return result;
}

// Check if player has an Ace
function hasAnAce(playerCards) {
  let trueOrNot = false;
  for (i = 0; i < playerCards.length; i++)
    if (playerCards[i]._value == 11) {
      trueOrNot = true;
      break;
    }
  return trueOrNot;
}

// Turns the Ace value from eleven to one when the player has an ace, and the hand is higher than 21
function turnAceToOne(cardsWhereTheAceIs) {
  function findAce(cardToFind) {
    return cardToFind.value > 10;
  }
  let indexOfAce = cardsWhereTheAceIs.findIndex(findAce);
  cardsWhereTheAceIs[indexOfAce]._value = 1;
}

//Return number and suit of the card that has been dealt
function describeDealtCard(dealtCard) {
  return dealtCard.number + " of " + dealtCard.suit;
}

//Return the current value of the players cards
function tellCurrentValue(playerCards) {
  return "The cards add to " + totalValue(playerCards) + ".";
}

//Returns the current hand of the player
function currentHand(player) {
  let currentHand = "";
  for (i = 0; i < player.length; i++) {
    if (i == player.length - 2) {
      currentHand += describeDealtCard(player[i]);
      continue;
    }
    if (i == player.length - 1) {
      currentHand += " and ";
      currentHand += describeDealtCard(player[i]);
      currentHand += ".";
      break;
    }
    currentHand += describeDealtCard(player[i]);
    currentHand += ", ";
  }
  return "current hand is: " + currentHand;
}

//Functions for jQuery

//Returns a string with the players card number and suit
function showCardDOM(player, card) {
  let cardNumber = player[card - 1].number;
  let cardSuit = player[card - 1].suit;
  let output = cardNumber;
  return output;
}

// Returns from the png file the converted html code
function turnSuitStringToSuitImg(player, card) {
  let cardSuit = player[card - 1].suit;
  if (cardSuit == "hearts") {
    return '<img src="images/heart-poker-piece.png">';
  } else if (cardSuit == "diamonds") {
    return '<img src="images/diamond-poker-piece.png">';
  } else if (cardSuit == "clubs") {
    return '<img src="images/chip-with-club.png">';
  } else if (cardSuit == "spades") {
    return '<img src="images/spades-poker-piece.png" >';
  }
}

// Appends a new card to the player's hand
function appendNewCardToPlayerHand(cardNumber) {
  let card = $(
    '<li class="card undealed_player" id="player_card">' +
      turnSuitStringToSuitImg(playerCards, cardNumber) +
      "<h3>" +
      showCardDOM(playerCards, cardNumber) +
      "</h3></li>"
  );
  return $("#player_hand").append(card) + appendCardPlayerAnimation();
}

// Appends a new card to the dealer's hand
function appendNewCardToDealerHand(cardNumber) {
  let card = $(
    '<li class="card undealed_dealer" id="dealer_card">' +
      turnSuitStringToSuitImg(dealerCards, cardNumber) +
      "<h3>" +
      showCardDOM(dealerCards, cardNumber) +
      "</h3></li>"
  );

  return $("#dealer_hand").append(card) + appendCardDealerAnimation();
}

/* 
Animations for the following:
player,
dealer
*/

function appendCardPlayerAnimation() {
  return (
    ";" +
    $(".undealed_player").animate(
      {
        bottom: "-1em",
        opacity: 1,
      },
      400
    ) +
    ";" +
    $(".undealed_player").removeClass("undealed_player")
  );
}

function appendCardDealerAnimation() {
  return (
    ";" +
    $(".undealed_dealer").animate(
      {
        bottom: "-1em",
        opacity: 1,
      },
      400
    ) +
    ";" +
    $(".undealed_dealer").removeClass("undealed_dealer")
  );
}

// Betting Functions

function increaseBet() {
  if (bank > 0) {
    bet += 5;
    bank -= 5;
  }
}

function decreaseBet() {
  if (bet > 5) {
    bet -= 5;
    bank += 5;
  }
}

function regularPrize() {
  bank += bet * prizeMult;
  betMemo = bet;
  bet = 0;
}

function noPrize() {
  bank += bet;
  betMemo = bet;
  bet = 0;
}

function blackjackPrize() {
  bank += bet * blackjackPrizeMult;
  betMemo = bet;
  bet = 0;
}

function losePrize() {
  betMemo = bet;
  bet = 0;
}

//End of Betting Functions

//HUD functions
function cleanUpForNewGame() {
  $("#player_score span").text("");
  $("#dealer_score span").text("");
  $(".card").remove();
  $("#tip").remove();
  playerCards = [];
  dealerCards = [];
  $("#big_event_message_holder").addClass("hidden");
  $("#ace_becomes_one_player").addClass("hidden");
}

function refreshBetHUD() {
  $("#set_bank span").text(bank);
  $("#set_bet span").text(bet);
  $("#bet span").text(bet);
  $("#bank span").text(bank);
}

//End of HUD Functions

// Start of the Functions for the actual game -------------------------------------------------

$(document).ready(function () {
  $("#big_event_message_holder").removeClass("hidden");
  /*
  Function that starts the game. Checks if the player has enough money (bank) to play
  If not, calls the "bankruptcy" function; otherwise, initializes the game
  */
  function gameStart() {
    if (bank <= 0) {
      bankruptcy();
    } else {
      gameStarted = true;
      // Prepare the game for a new round by cleaning up previous data
      cleanUpForNewGame();
      // Creates a new deck of cards
      createDeck();
      // Sets the initial bet for the game
      setBet();
    }
  }

// Function that handles the process of setting the bet for the game
  function setBet() {
    let betSetted = false;
    $("#bet_wrapper").removeClass("hidden");
    $("#bet_buttons").removeClass("hidden");
    refreshBetHUD();

    /*
    Functions that handle the events of clicking several buttons
    Up Arrow
    Down Arrow
    Enter Key
    Set Bet
    Up Bet
    Down Bet
    */

    $("#button_more_bet").on("click", function () {
      if (!betSetted) {
        increaseBet();
        refreshBetHUD();
      }
    });

    $(window).keydown(function (e) {
      if (!betSetted && e.which == 38) {
        increaseBet();
        refreshBetHUD();
      }
    });

    $("#button_less_bet").on("click", function () {
      if (!betSetted) {
        decreaseBet();
        refreshBetHUD();
      }
    });

    $(window).keydown(function (e) {
      if (!betSetted && e.which == 40) {
        decreaseBet();
        refreshBetHUD();
      }
    });

    $("#button_set_bet").on("click", function () {
      if (!betSetted) {
        $("#bet_wrapper").addClass("hidden");
        $("#bet_buttons").addClass("hidden");
        dealFirstCards();
        betSetted = true;
      }
    });

    $(window).keyup(function (e) {
      if (!betSetted && e.which == 13) {
        $("#bet_wrapper").addClass("hidden");
        $("#bet_buttons").addClass("hidden");
        dealFirstCards();
        betSetted = true;
      }
    });
  }
//End of Button Functions

  function dealFirstCards() {
    // Function that deals player two cards
    playerCards.push(randomCard(), randomCard());
    currentCardsPlayer = 2;

    // Function that deals dealer two cards
    dealerCards.push(randomCard(), randomCard());
    currentCardsDealer = 2;

    showHUD();

    appendNewCardToPlayerHand(1);
    setTimeout(function () {
      return appendNewCardToPlayerHand(2);
    }, cardDealingTimeout);
    setTimeout(function () {
      return appendNewCardToDealerHand(1);
    }, cardDealingTimeout * 2);

    // Function that is for the unflipped dealer card
    var secondCardDealerFlipped = $('<li class="card flipped undealed_dealer" id="dealer_card"><h3></h3></li>');
    $("#dealer_hand").append(secondCardDealerFlipped);
    appendCardDealerAnimation();
    if (totalValue(playerCards) > 21 && hasAnAce(playerCards)) {
      turnAceToOne(playerCards);
      $("#ace_becomes_one_player").removeClass("hidden");
    }
    if (totalValue(playerCards) == 21) blackjackCheck();
    else {
      playerTurn = true;
    }
  }

  // HUD appears for player choices
  function showHUD() {
    $("#stand").removeClass("hidden");
    $("#hit").removeClass("hidden");
    $("#player_score span").text("" + totalValue(playerCards) + "");
    $("#dealer_score span").text("" + dealerCards[0].value + "");
    $("#player_score").removeClass("hidden");
    $("#dealer_score").removeClass("hidden");
    $("#bank").removeClass("hidden");
    $("#bet").removeClass("hidden");
  }

  // The player is given the choice to hit or stand

  // If the player clicks Hit, the player receives another card
  function hit() {
    $("#ace_becomes_one_player").addClass("hidden");
    playerCards.push(randomCard());
    currentCardsPlayer++;
    appendNewCardToPlayerHand(currentCardsPlayer);
    //If the hand is over 21 and it has an Ace, the Ace becomes value 1 instead of 11
    if (totalValue(playerCards) > 21 && hasAnAce(playerCards)) {
      turnAceToOne(playerCards);
      $("#ace_becomes_one_player").removeClass("hidden");
    }

    $("#player_score span").text("" + totalValue(playerCards) + "");

    // If the total value of the player's cards is over 21, the player bust
    if (totalValue(playerCards) > 21) {
      playerTurn = false;
      gameStarted = false;
      setTimeout(function () {
        playerBust();
      }, bigSignTimeout);
    } else {
      playerTurn = true;
    }
  }
  // This function can be repeated until the player goes over 21 or chooses to stand

  // If the player chooses to stand, the dealer reveals their hidden card
  function stand() {
    $("#ace_becomes_one_player").addClass("hidden");
    $(".flipped").remove();
    appendNewCardToDealerHand(currentCardsDealer);
    $("#dealer_score span").text("" + totalValue(dealerCards) + "");

    dealersDecision();
  }

/*
Using a similar approach as in the player's turn, we define the dealer's hand and its 
corresponding total value
  
In cases where the total value surpasses 21 and the dealer holds
an Ace, the Ace's value will be adjusted to 1 instead of 11
*/

  function dealersDecision() {
    if (totalValue(dealerCards) > 21 && hasAnAce(dealerCards)) turnAceToOne(dealerCards);
    $("#dealer_score span").text("" + totalValue(dealerCards) + "");

    /*
    Moving on to the dealer's move - they will keep drawing additional cards until the total value
    of their hand reaches 17 or more - Once this threshold is reached, the decideWinner() function
    is executed 
    
    However, if the dealer's total hand value exceeds 21 during this process, the 
    player wins the game
    */

    if (totalValue(dealerCards) > 21)
      setTimeout(function () {
        dealerBust();
      }, bigSignTimeout);
    else if (totalValue(dealerCards) == 21) decideWinner();
    else if (totalValue(dealerCards) >= 17) decideWinner();
    else dealerTakeACard();
  }

  function dealerTakeACard() {
    $("#dealer_score span").text("" + totalValue(dealerCards) + "");

    setTimeout(function () {
      dealerCards.push(randomCard());
      currentCardsDealer++;
      appendNewCardToDealerHand(currentCardsDealer);
      $("#dealer_score span").text("" + totalValue(dealerCards) + "");
      dealersDecision();
    }, cardTimeout);
  }

// End of dealer decision functions 

  // Function that decides whether or not the dealer or the player won
  function decideWinner() {
    setTimeout(function () {
      if (totalValue(playerCards) > totalValue(dealerCards)) youWin();
      else if (totalValue(playerCards) == totalValue(dealerCards)) push();
      else youLose();
    }, bigSignTimeout);
  }

/*
When the player's first two cards add up to 21, it is considered a blackjack, 
resulting in an automatic win for the player unless the dealer also has a blackjack
  
In the event that both the player and the dealer have a blackjack, the game ends in a draw
*/

  function blackjackCheck() {
    console.log("Player blackjack!");
    console.log("Dealer flips his hidden card. It is a " + describeDealtCard(dealerCards[1]) + ".");
    console.log("Dealer " + currentHand(dealerCards));

    if (totalValue(playerCards) > totalValue(dealerCards))
      setTimeout(function () {
        blackjack();
      }, bigSignTimeout);
    else if (totalValue(playerCards) == totalValue(dealerCards))
      setTimeout(function () {
        blackjackPush();
      }, bigSignTimeout);
  }

// Different game outcomes and corresponding messages

  // Player gets a blackjack, so they win double the prize
  function blackjack() {
    
    blackjackPrize();
    gameStarted = false;
    $("#big_event_message_holder h1").text("Blackjack!");
    $("#big_event_message_holder h3").text("Awesome! Double prize!");
    $("#big_event_message_holder h2").text(`You won ${betMemo * blackjackPrizeMult - betMemo}$`);
    $("#big_event_message_holder").removeClass("hidden");
  }

  // Both player and dealer have blackjack, resulting in a draw
  function blackjackPush() {
    noPrize();
    gameStarted = false;
    $("#big_event_message_holder h1").text("Blackjack!");
    $("#big_event_message_holder h3").text("Unfortunately, the dealer also has Blackjack");
    $("#big_event_message_holder h2").text(`You recover your ${betMemo}$`);
    $("#big_event_message_holder").removeClass("hidden");
  }

  // Player's cards exceed 21 (bust), so the player loses the game
  function playerBust() {
    losePrize();
    gameStarted = false;
    $("#big_event_message_holder h1").text("Bust! You Lose!");
    $("#big_event_message_holder h3").text("Your cards are over 21");
    $("#big_event_message_holder h2").text(`You lose ${betMemo}$`);
    $("#big_event_message_holder").removeClass("hidden");
  }

  // Dealer's cards exceed 21 (bust), so the player wins the game
  function dealerBust() {
    regularPrize();
    gameStarted = false;
    $("#big_event_message_holder h1").text("You win!");
    $("#big_event_message_holder h3").text("Dealer cards are over 21");
    $("#big_event_message_holder h2").text(`You won ${betMemo * prizeMult - betMemo}$`);
    $("#big_event_message_holder").removeClass("hidden");
  }

  // Player and dealer have the same score, resulting in a draw
  function push() {
    noPrize();
    gameStarted = false;
    $("#big_event_message_holder h1").text("Push!");
    $("#big_event_message_holder h3").text("Player and dealer have the same score");
    $("#big_event_message_holder h2").text(`Your recover your ${betMemo}$`);
    $("#big_event_message_holder").removeClass("hidden");
  }

  // Player's cards value is higher than the dealer's, so the player wins the game
  function youWin() {
    regularPrize();
    gameStarted = false;
    $("#big_event_message_holder h1").text("You win!");
    $("#big_event_message_holder h3").text("Your cards value is higher than dealers'");
    $("#big_event_message_holder h2").text(`You won ${betMemo * prizeMult - betMemo}$`);
    $("#big_event_message_holder").removeClass("hidden");
  }

  // Dealer's cards value is higher than the player's, so the player loses the game
  function youLose() {
    losePrize();
    gameStarted = false;
    $("#big_event_message_holder h1").text("You lose!");
    $("#big_event_message_holder h3").text("Dealer cards value is higher than yours");
    $("#big_event_message_holder h2").text(`You lose ${betMemo}$`);
    // showTips();
    $("#big_event_message_holder").removeClass("hidden");
  }

  // Player is out of money (bankrupt) and cannot continue playing
  function bankruptcy() {
    gameStarted = true;
    $("#big_event_message_holder h1").text("Bankruptcy");
    $("#big_event_message_holder h3").text("You've no more money to bet.");
    $("#big_event_message_holder h2").text(`Get out of here!`);
    $("#big_event_message_holder").removeClass("hidden");
  }

  // Game (Event) is repeated when the player clicks again after the game is over
  $("#big_event_message_holder").on("click", function (e) {
    if (!gameStarted) {
      gameStart();
    }
  });
  $(document).keyup(function (e) {
    if (!gameStarted && e.which != 13) {
      gameStart();
    }
  });

  // Clicking on the "Hit" button or pressing the right arrow key triggers the hit() function
  $("#hit").on("click", function () {
    if (playerTurn == true && gameStarted) {
      playerTurn = false;
      hit();
    }
  });
  $(document).keyup(function (e) {
    if (playerTurn == true && gameStarted && e.which == 39) {
      playerTurn = false;
      hit();
      playerTurn = true;
    }
  });

  // Clicking on the "Stand" button or pressing the left arrow key triggers the stand() function
  $("#stand").on("click", function () {
    if (playerTurn == true && gameStarted) {
      playerTurn = false;
      stand();
    }
  });

  $(document).keyup(function (e) {
    if (playerTurn == true && gameStarted == true && e.which == 37) {
      playerTurn = false;
      stand();
    }
  });
});
