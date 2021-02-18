
//DECK JS
 const SUITS = ["♠","♥","♣","♦"]
 const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
 const GAMESTATES = ["WELCOME", "INSTRUCTIONS", "PLAY", "PAYOUT"]
 const PlayState = ["DEAL", "MOVE"]
 const PLAYERMOVES = ["HIT", "STAND", "SPLIT", "DOUBLEDOWN"]

 
 class Game {
    constructor() {
        this.deck = new Deck();
        this.player = new Player();
        this.dealer = new Dealer();
        this.state = GAMESTATES.WELCOME;
        this.betAmount = 0;
        this.splitBetAmount = 0;
        this.insuranceTaken = false;
        this.doubledDown = false;
        this.insuranceBetAmount = 0;
        this.betPlaced = false;
        this.playerHasHit = false;
    }



    clearHandAndAwaitUserBet() {
        this.clearHands();
        this.showBettingControls();
    }

    updateBetAmountButton() {
        document.getElementById("currentBetAmountH3").innerHTML = this.betAmount;
    }

    updateBankrollDisplay() {
        document.getElementById("current-bank-roll").innerHTML = this.player.bankroll;
    }

    playGame() {
        this.updateBankrollDisplay();
        console.log("bet placed");
        this.deck.resetDeck();
        this.deck.shuffle();
        console.log("dealing 2 cards to each player");
        this.initialDeal();
        this.showActionControls();
       
        // if (!this.checkForBlackjack(this.player.hand)) {
        //         this.playerPlays(this.player.hand, this.betAmount);
        //         this.dealerPlays();
        // }
        // else if(this.checkForBlackjack(this.player.hand) && this.   dealerHasFaceUpAce())
        //         this.dealerPlays();

        
        // if(this.player.hasSplit) {
        //     console.log("first hand results");
        //     this.checkResults(this.player.hand, this.betAmount);
        //     console.log("second hand results");
        //     this.checkResults(this.player.hand2, this.splitBetAmount);
        // }

        // else {
        //     this.checkResults(this.player.hand, this.betAmount);
        // }
    }
    

    placeBet() {
        this.displayBankroll();

        //dont let user bet 0
        if(this.betAmount > 0)
        {
            this.player.bankroll -= this.betAmount;
            console.log("You have bet: $" + this.betAmount);
            this.hideBettingControls();
            this.playGame();
        }
        else
            console.log("You have to add a bet");
    }

    increaseBetByAmount(amountToIncrease) {
        ///validation that user actually have enough money

        if (this.player.bankroll > (this.betAmount + amountToIncrease)){
            this.betAmount += amountToIncrease;
            this.updateBetAmountDisplay();
        }
        else{
            console.log("You don't have the funds for this");
        }
    }
    
    updateBetAmountDisplay() {
        document.getElementById("current-bet-amount").innerHTML = this.betAmount;
    }

    showBettingControls() {
        var bettingControls = document.getElementById("bettingControls");
        bettingControls.style.display = "block";
    }

    hideSplitButton() {
        document.getElementById("split-btn").style.display = "none";
    }

    hideDoubleDownButton() {
        document.getElementById("double-btn").style.display = "none";
    }

    showSplitButton() {
        document.getElementById("split-btn").style.display = "inline";
    }

    showDoubleDownButton() {
        document.getElementById("double-btn").style.display = "inline";
    }

    showInsuranceButton() {
        document.getElementById("insurance-btn").style.display = "inline";
    }

    hideInsuranceButton() {
        document.getElementById("insurance-btn").style.display = "none";
    }


    
    showActionControls() {
        var actionControls = document.getElementById("actionControls");
        actionControls.style.display = "block";

        if(this.dealerHasFaceUpAce()) {
            this.showInsuranceButton();
        }
       
        let playerCanSplit = (this.player.hand[0].value === this.player.hand[1].value);
        if(playerCanSplit)
        {
            this.showSplitButton();
        }

        this.showDoubleDownButton();

    }
    
    hideBettingControls() {
        var bettingControls = document.getElementById("bettingControls");
        bettingControls.style.display = "none";
    }
    
    hideActionControls() {
        var actionControls = document.getElementById("actionControls");
        actionControls.style.display = "none";
    }
    
    add25ToBet(){
       this.increaseBetByAmount(25);
       this.updateBetAmountButton();
    }
    
    add50ToBet(){
        this.increaseBetByAmount(50);
        this.updateBetAmountButton();
     }

    add75ToBet(){
        this.increaseBetByAmount(75);
        this.updateBetAmountButton();
     }

    add100ToBet(){
        this.increaseBetByAmount(100);
        this.updateBetAmountButton();
    }



    ////

    drawCardFromDeck(handToDrawTo, handDiv) {
        let drawnCardArray = this.deck.drawCard();
        handToDrawTo.push(drawnCardArray[0]);
        
        let cardIsRed = ((drawnCardArray[0].suit === '♥') || (drawnCardArray[0].suit === '♦'));

        let suitAndValue = "" + drawnCardArray[0].suit + drawnCardArray[0].value;

        let HTMLforCard = "";

        if (cardIsRed) {
            HTMLforCard = "<div class=\"card-show card-is-red\">" + suitAndValue + "</div>";
        }
        else {
            HTMLforCard = "<div class=\"card-show\">" + suitAndValue + "</div>";
        }

        handDiv.innerHTML = handDiv.innerHTML + HTMLforCard;
    }
    

    

    initialDeal() {
        this.dealerDrawsCard();
        this.playerDrawsCard();
        this.dealerDrawsCard();
        this.playerDrawsCard();
        //this.giveDealerBlackJack();
    }

    dealerDrawsCard() {
        this.drawCardFromDeck(this.dealer.hand, document.getElementById("dealersHand"));
    }

    playerDrawsCard() {
        this.drawCardFromDeck(this.player.hand, document.getElementById("playersHand"));
    }

    clearHands() {
        this.player.clearHand();
        this.dealer.clearHand();
    }

    resetDataForRound() {
        this.clearHands();
        this.betAmount = 0;
        this.splitBetAmount = 0;
        this.insuranceTaken = false;
        this.doubledDown = false;
        this.insuranceBetAmount = 0;
        this.deck.resetDeck();
        this.deck.shuffle();
    }
    
    dealerHasFaceUpAce() {
        if (this.dealer.hand[0].value === 'A'){
            return true;
        }
        else
            return false;
    }
            
    payoutWinnings(amountToPayOut) {
        console.log("You have won $" + amountToPayOut)
        this.player.bankroll += amountToPayOut;
        this.updateBankrollDisplay();
    }

    payoutInsurance() {
        let winnings = this.insuranceBetAmount * 2;
        console.log("Your insurance paid out $" + winnings);
        this.player.bankroll += winnings;
        this.updateBankrollDisplay();
    }

    displayBankroll() {
        console.log("You have $" + this.player.bankroll);
    }




    checkResults(handToCheck, betAmountForHand) {
        this.hideActionControls();
        this.dealerPlays();

        let playerHasBlackjack = this.checkForBlackjack(handToCheck);
        let playerIsBust = User.checkBust(handToCheck);
        let dealerIsBust = User.checkBust(this.dealer.hand);
        let dealerHasBlackjack = this.checkForBlackjack(this.dealer.hand);
        let dealerAndPlayerHaveSameHandValue = User.getHandValue(handToCheck) === User.getHandValue(this.dealer.hand);
        let playersHandBeatsDealersHand = User.getHandValue(handToCheck) > User.getHandValue(this.dealer.hand);



        if (playerHasBlackjack) {
            console.log("You have blackjack, you win! ");
            this.payoutWinnings(2.5*betAmountForHand);
        }
        else if (playerIsBust) {
            console.log("You went bust, the House wins. ");
            this.displayBankroll();
        }
        else if (dealerHasBlackjack) {
            console.log("The house has blackjack, the House wins. ");
            this.displayBankroll();
        }
        else if(dealerAndPlayerHaveSameHandValue) {
            console.log("Push -- you get your bet back");
            this.payoutWinnings(betAmountForHand);
        }
        else if(playersHandBeatsDealersHand) {
            console.log("You win!");
            this.payoutWinnings(betAmountForHand*2);
        }
        else if(dealerIsBust) {
                console.log("The Dealer bust! You win!");
                this.payoutWinnings(betAmountForHand*2);
        }
        else
            console.log("The House wins");

        if(this.insuranceTaken) {
            if(dealerHasBlackjack) {
                this.payoutInsurance(); 
            }
            else {
                console.log("Your insurance flopped, you lost $" + (this.betAmount / 2));
            }
        }
    }



    hit() {
        this.hideDoubleDownButton();
        this.playerDrawsCard();
        if (User.checkBust(this.player.hand)){
            this.checkResults(this.player.hand, this.betAmount);
        }
        else {
        }
    }

    stand() {
        this.checkResults(this.player.hand, this.betAmount);
    }

    doubleDown() {

        if(this.betAmount < this.player.bankroll)
        {
            this.doubledDown = true;
            //place bet of this.betAmount
            //update controls

            this.player.bankroll -= this.betAmount;
            this.betAmount = this.betAmount*2;

            this.updateBankrollDisplay();
            this.updateBetAmountDisplay();

            this.playerDrawsCard();
            this.stand();
        }
        else
        {
            console.log("You do not have the facilities for this big man");
       }
    }

    dealerPlays() {
        let dealerHandValue = User.getHandValue(this.dealer.hand);

        if (!User.checkBust(this.dealer.hand))
        {
                while(dealerHandValue < 17){
                    this.dealerDrawsCard();
                    dealerHandValue = User.getHandValue(this.dealer.hand);
                    if(dealerHandValue > 21)
                        this.dealer.bust = true;
                }
        }
    }

    checkForBlackjack(handToCheckForBlackjack) {
        if((handToCheckForBlackjack.length === 2) && (User.getHandValue(handToCheckForBlackjack) === 21)){
            return true
        }
        else 
            return false;
    }

    playerPlays(handBeingPlayed, betAmountForHand) {

        let stillPlaying = true;
        while(!this.player.bust && stillPlaying) {
            switch(playerOption) {
                case '1':
                    this.hit(handBeingPlayed);
                    break;
                case '2':
                    stillPlaying = false;
                    break;
                case '3':
                    if (!this.player.hasSplit) {
                        this.playerSplits();
                        stillPlaying = false;
                    }
                    else
                        console.log("You have already split!")
                    break;
                case '4':
                    this.doubleDown(betAmountForHand);
                    this.hit(handBeingPlayed);
                    stillPlaying = false;
                    break;
                case '5':
                    if (!this.insuranceTaken){
                        this.takeInsurance();
                    }
                    else{
                        console.log("You have already taken out insurance against the dealers hand.")
                    }
                    break;
            }
        }
    }


    displayHand(handToDisplay) {
        for (let card of handToDisplay) {
            console.log("You have " + card.value + card.suit)
        }
    }

    displayDealersFirstCard() {
        console.log("The Dealer has: " + this.dealer.hand[0].value + this.dealer.hand[0].suit)
    }

    displayDealersHand() {
        console.log("Dealers hand: ");
        for (let card of this.dealer.hand) {
            console.log(card.value + card.suit);
        }
    }

    playerSplits() {
        if(this.betAmount < this.player.bankroll)
        {
        this.player.splitHand();
        //bet for same amount
        this.splitBetAmount = this.betAmount;
        this.player.bankroll -= this.splitBetAmount;
        this.displayBankroll();

        //add card to each hand
        this.drawCardFromDeck(this.player.hand);
        this.drawCardFromDeck(this.player.hand2);


        console.log("first hand")
        this.displayHand(this.player.hand);

        console.log("second hand")
        this.displayHand(this.player.hand2);

        console.log("playing first hand")
        this.playerPlays(this.player.hand, this.betAmount);

        console.log("playing second hand")
        this.playerPlays(this.player.hand2, this.splitBetAmount);
    }
        else
        {
            console.log("You do not have the facilities for this big man");
            this.displayHand(this.player.hand);            
        }
        
    }
    
        

    takeInsurance() {
        //add validation that player has enough bankroll
        this.hideInsuranceButton();
        console.log("Insurance taken");
        this.insuranceTaken = true;
        this.insuranceBetAmount = this.betAmount/2;
        console.log("insurance bet of $" + this.insuranceBetAmount);
        this.player.bankroll -= this.insuranceBetAmount;
        this.updateBankrollDisplay();
    }

    // doubleDown(betToDoubleDown){
    //     if(betToDoubleDown < this.player.bankroll)
    //     {
    //         this.doubledDown = true;
    //         console.log("You doubled down");
    //         this.player.bankroll -= betToDoubleDown;
    //         betToDoubleDown = betToDoubleDown*2;
    //     }
    //     else
    //     {
    //         // dont have enough money
    //         console.log("You do not have the facilities for this big man");
    //     }
    // }
    
    // METHODS FOR TESTING
    // givePlayerBlackJack() {
    //     let aceOfSpades = new Card("♠","A"); 
    //     let tenOfSpades = new Card("♠","10");
    //     this.player.hand.push(aceOfSpades);
    //     this.player.hand.push(tenOfSpades);
    // }

    giveDealerBlackJack() {
        let aceOfSpades = new Card("♠","A"); 
        let tenOfSpades = new Card("♠","10");
        this.dealer.hand.push(aceOfSpades);
        this.dealer.hand.push(tenOfSpades);
    }

    // givePlayerTwoAces() {
    //     let aceOfSpades = new Card("♠","A"); 
    //     let aceOfDiamonds = new Card("♦","A"); 
    //     this.player.hand.push(aceOfSpades);
    //     this.player.hand.push(aceOfDiamonds);
    // }
    //

    // checkState(GAMESTATES)
    //  {
    //      switch(this.state)
    //      {
    //          case "WELCOME":
    //             // code for the welcome page 
    //             break;

    //         case "INSTRUCTION":
    //             // code for instruction page
    //             break;

    //         case "PLAY":
    //             // Play has sub sets: deal, move
                
    //             playGame();
    //             break;

    //         case "PAYOUT":
    //             // gives player money
    //             payout();
    //             break;
    //     }
    // }
}
        
class User {
    constructor() {
        this.hand = [];
        this.bankroll = 1000;
        this.bust = false;
        this.hasSplit = false;
    }
    
    clearHand() {
        this.hand = [];
    }

    static getHandValue(handToCalculateValueFor) {
        let tempHandValue = 0;      
        let arrayOfCardIntValues = [];
        let numberOfAces = 0;

        // let cardValues = handToCalculateValueFor.map(card => card.intValue);
        // cardValues.sort((a, b) => a - b);
        for (let card of handToCalculateValueFor) {
            if (card.intValue != 11)
                tempHandValue += card.intValue;
            else {
                numberOfAces++;
                //console.log("Counted " + numberOfAces + " aces")
            }
                
        }

        if (numberOfAces > 0){
            if(numberOfAces == 1){
                if((tempHandValue + 11) > 21)
                    tempHandValue += 1;
                else
                    tempHandValue += 11;
            }
            else if (numberOfAces == 2){
                if((tempHandValue + 12) > 21)
                    tempHandValue += 2;
                else
                    tempHandValue += 12;
            }
            else if (numberOfAces == 3){
                if((tempHandValue + 13) > 21)
                    tempHandValue += 3;
                else
                    tempHandValue += 13;
            }
            else if (numberOfAces == 4){
                if((tempHandValue + 14) > 21)
                    tempHandValue += 4;
                else
                    tempHandValue += 14;
            }
        }



        return parseInt(tempHandValue);
    }
    
    // getHandValue(handToCalculateValueFor) {
    //     this.updateHandValue(handToCalculateValueFor);
    //     return this.handValue;
    // }

    splitHand() {
        this.hasSplit = true;
        this.hand2 = [];

        const cardToAddToHand2 = this.hand.slice(-1);
        this.hand2.push(cardToAddToHand2[0]);
        this.hand.pop(cardToAddToHand2[0]);
    }

    static checkBust(handToCheck) {
        if (User.getHandValue(handToCheck) > 21)
            return true;   
        else
            return false;
    }

    // drawInitialHand() {
    //     this.draw();
    //     this.draw();
    // }
}

class Player extends User  {
    // constructor() {
    //     this.bankroll = 1000;
    //     this.name = "";
    // }
    


    split() {
        let handSizeEqualTwo = (this.hand.length === 2);
        let bothCardsHaveEqualValue = this.hand[0].value === this.hand[1].value;
        
        if(handSizeEqualTwo && bothCardsHaveEqualValue) {
            //logic for split
            //Possibly need to make a tempoary hand2 value and put one in each
            
            console.log("This will be split");
        }
        else
        console.log("This will not be split");
    }
}

class Dealer extends User {

}

 
class Deck{
     constructor() {
         this.cards = this.resetDeck();
     }

    resetDeck() {
        let cards = [];
         for (let suit of SUITS) {
             for (let value of VALUES) {
                 let cardToAdd = new Card(suit, value);
                 cards.push(cardToAdd);
             }
         }
         return cards;
     }

     drawCard() {
        const cardsDrawn = this.cards.slice(-1);
        this.cards = this.cards.slice(0, -1);
        return cardsDrawn;
     }

     deckSize() {
         return this.cards.length;
     }

     shuffle() {
         for(let i = this.deckSize() - 1; i > 0; i--){
             const newLocation = Math.floor(Math.random() * (i + 1)); //Random location before the card we are on
             const oldCard = this.cards[newLocation]; // Switched the card we are currently on with new card at the random location
             this.cards[newLocation] = this.cards[i];
             this.cards[i] = oldCard;
         }
     }

     displayDeck() {
         for (let c of this.cards) {
            console.log(c.value + c.suit);
         }
     }
 }

 class Card{
    constructor(suit, value){
         this.suit = suit;
         this.value = value;
         this.intValue = this.numericValue();
         this.aceValueOf11 = true;
     }
    get colour(){
         return this.suit === "♠" || this.suit === "♣" ? 'black': 'red'
    }
    numericValue() {
        if (['J', 'Q', 'K'].includes(this.value)){
            return 10;
        }
        else if (this.value === ('A')){
            return 11;
        }
        else {
            return parseInt(this.value);
        }
    }
 }



const blackjackGame = new Game();


function startGame() {
    var startGameBtn = document.getElementById("start-control-btn");
    startGameBtn.style.display = "none";
    blackjackGame.clearHandAndAwaitUserBet();
}
