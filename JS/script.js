const SUITS = ["♠","♥","♣","♦"]
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

class Game {
    constructor() {
        this.deck = new Deck();
        this.player = new User();
        this.dealer = new User();
        this.betAmount = 0;
        this.splitBetAmount = 0;
        this.insuranceTaken = false;
        this.doubledDown = false;
        this.insuranceBetAmount = 0;
        this.betPlaced = false;
        this.playerHasHit = false;
        this.playing = true;
        this.hasSplit = false;
        this.hand1played = false;
        this.hand2played = false;
        this.dealerHasPlayedAfterSplit = false;
        this.bothHandsCheckedAndPlayed = false;
        this.firstHandResultsString = "";
        this.showTips = true;
        this.splitAndInsuranceFlopped = false;
        this.currentlySelectedHand = this.player.hand;
        this.currentlySelectedHandDiv = document.getElementById("playersHand");
        
        if(parseInt(localStorage.bankroll)) //check if data is saved for bankroll and update
            this.player.setBankrollFromLocalStorage();
    }

    resetLocalData(){
        localStorage.clear();
        this.player.bankroll = 1000; //set bankroll back to 1000, the default
        this.updateBankrollDisplay();
    }

    playerClicksOffResultsPopUp(){
        document.getElementById("resultsBox").style.display = "none";
        
        //new hand
        this.resetDataForRound();
        this.clearHandAndAwaitUserBet();
    }

    clearHandAndAwaitUserBet(){
        this.updateBankrollDisplay();
        this.clearHands();
        this.showBettingControls();
    }

    playGame(){ //reset data and shuffle ready for a new hand
        this.updateBankrollDisplay();
        this.deck.resetDeck();
        this.deck.shuffle();
        this.initialDeal();

        if(this.checkForBlackjack(this.player.hand)) {
            this.checkResults(this.player.hand, this.betAmount);
            return;
        }

        this.hideInsuranceButton();
        this.hideSplitButton();
        this.hideDoubleDownButton();

        this.showActionControls();
        this.gameTip();
    }
    
    placeBet(){
        if(this.betAmount > 0){
            this.player.bankroll -= this.betAmount;
            this.player.updateLocalStorageBankroll();
            this.hideBettingControls();
            this.playGame();
        }
    }

    increaseBetByAmount(amountToIncrease){
        let playerCanAffordToBet = this.player.bankroll >= (this.betAmount + amountToIncrease);
            
        if (playerCanAffordToBet){
            this.betAmount += amountToIncrease;
            this.updateBetAmountDisplay();
        }
    }

    drawCardFromDeck(handToDrawTo, handDiv, displayFaceDown){ // this function will take in the hand destination for the card, the htlm div to put it in and a boolean whether the card should be faced up or down
        let drawnCardArray = this.deck.drawCard();
        handToDrawTo.push(drawnCardArray[0]); // adds the card to the hand 
        let cardIsRed = ((drawnCardArray[0].suit === '♥') || (drawnCardArray[0].suit === '♦'));
        let suitAndValue = "" + drawnCardArray[0].suit + drawnCardArray[0].value;
        let HTMLforCard = "";

        if (cardIsRed){
            if (displayFaceDown)
                HTMLforCard = "<div class=\"card-show card-is-red\" id=\"dealers-hidden-card\"> <span>" + suitAndValue + " </span> </div>";
            else
                HTMLforCard = "<div class=\"card-show card-is-red\">" + suitAndValue + "</div>";
        }
        else{
            if (displayFaceDown)
                HTMLforCard = "<div class=\"card-show\" id=\"dealers-hidden-card\"> <span>" + suitAndValue + "</span> </div>";
            else
                HTMLforCard = "<div class=\"card-show\">" + suitAndValue + "</div>";
        }
        
        handDiv.innerHTML = handDiv.innerHTML + HTMLforCard; //append the hand div with the new card
    }

    initialDeal(){ //resetting lots of game variables to default state
        this.currentlySelectedHand = this.player.hand;
        this.dealerHasPlayedAfterSplit = false;
        this.bothHandsCheckedAndPlayed = false;
        this.firstHandResultsString = "";
        this.splitAndInsuranceFlopped = false;

        document.getElementById("playersHand").innerHTML = "";
        document.getElementById("dealersHand").innerHTML = "";

        this.dealerDrawsCard(false); //2 cards for each player, dealers 2nd is face down
        this.playerDrawsCard();
        this.dealerDrawsCard(true);
        this.playerDrawsCard();
    }

    dealerDrawsCard(displayFaceDown){
        this.drawCardFromDeck(this.dealer.hand, document.getElementById("dealersHand"), displayFaceDown);
    }

    playerDrawsCard(){
        this.drawCardFromDeck(this.currentlySelectedHand, this.currentlySelectedHandDiv, false);
    }

    resetDataForRound(){
        this.clearHands();
        this.betAmount = 0;
        this.splitBetAmount = 0;
        this.insuranceTaken = false;
        this.doubledDown = false;
        this.insuranceBetAmount = 0;
        this.deck.resetDeck();
        this.deck.shuffle();
    }
    
    clearHands(){
        this.player.clearHand();
        this.dealer.clearHand();

        const playersHand1Div = document.getElementById("playersHand");
        const playersHand2Div = document.getElementById("playersHand2");
        const dealersHandDiv = document.getElementById("dealersHand");
        
        //playersHand1Div.className = "active-hand"; //hard reset the players first hand to the default (active-hand) and hide the 2nd hand
        playersHand2Div.className = "";
        playersHand2Div.style.display = "none";

        this.currentlySelectedHandDiv = playersHand1Div; //set currentlySelectedHandDiv back to first hand

        playersHand1Div.innerHTML = "<div class=\"padding-card\"></div>"; //remove the cards from both players hands and the dealers
        playersHand2Div.innerHTML = "";
        dealersHandDiv.innerHTML = "<div class=\"padding-card\"></div>";

        
    }

    dealerHasFaceUpAce(){ // this is used to check if the player qualifies for insurance
        return this.dealer.hand[0].value === 'A';
    }
            
    payoutWinnings(amountToPayOut){
        this.player.bankroll += amountToPayOut;
        this.player.updateLocalStorageBankroll();
        this.updateBankrollDisplay();
    }

    payoutInsurance(){ // function is called to pay the player their winnings when they have won and took insurance during the game
        this.insuranceTaken = false;
        let winnings = this.insuranceBetAmount * 2;
        this.player.bankroll += winnings;
        this.player.updateLocalStorageBankroll();
        this.updateBankrollDisplay();
    }

    checkResults(handToCheck, betAmountForHand){ // this function will take in the hand to check and the bet amount and work out if the player has won or lost
        this.hideActionControls();

        if(!this.bothHandsCheckedAndPlayed){ // ensures that both hands, when the player splits, are checked oncce
            let playerHasSplitAndNotPlayedSecondHandYet = this.hasSplit && !this.hand1played;

            if(playerHasSplitAndNotPlayedSecondHandYet){
                this.hand1played = true;

                this.shiftFocusToSecondHand();
                this.showActionControls();
                
                return; //break out of the checkresults method and wait for user to do something with 2nd hand
            }

            let playerHasSplitAndPlayedBothHands = this.hasSplit && this.hand1played;

            if(playerHasSplitAndPlayedBothHands)
                this.hand2played = true;

            if (this.hasSplit && this.hand1played && this.hand2played) {
                //player has split and played both their hands
                //reset the boolean flags and then checkresults for both hands
                
                this.hand1played = false;
                this.hand2played = false;

                if(!this.dealerHasPlayedAfterSplit) {
                    this.dealerHasPlayedAfterSplit = true;
                    this.dealerPlays(); 
                }
                
                this.bothHandsCheckedAndPlayed = true;

                this.checkResults(this.player.hand, this.betAmount);
                this.checkResults(this.player.hand2, this.splitBetAmount);
                
                this.hasSplit = false;

                return; //break from the checkresults method once both hands have had results checked after a split
            }
        }

        let resultsString = "";
        
        let playerHasBlackjack = this.checkForBlackjack(handToCheck);

        if(!playerHasBlackjack)
            if(!this.hasSplit)
                this.dealerPlays();

        let playerIsBust = User.checkBust(handToCheck);
        let dealerIsBust = User.checkBust(this.dealer.hand);
        let dealerHasBlackjack = this.checkForBlackjack(this.dealer.hand);
        let dealerAndPlayerHaveSameHandValue = User.getHandValue(handToCheck) === User.getHandValue(this.dealer.hand);
        let playersHandBeatsDealersHand = User.getHandValue(handToCheck) > User.getHandValue(this.dealer.hand);

        if (playerHasBlackjack){
            resultsString += "You have blackjack, you win! ";
            this.payoutWinnings(2.5*betAmountForHand);
        }
        else if (playerIsBust)
            resultsString += "You went bust, the House wins. ";
        else if (dealerHasBlackjack)
            resultsString += "The house has blackjack. ";
        else if(dealerAndPlayerHaveSameHandValue) {
            resultsString += "Push, your initial wager is returned. ";
            this.payoutWinnings(betAmountForHand);
        }
        else if(playersHandBeatsDealersHand){
            resultsString += "You win! ";
            this.payoutWinnings(betAmountForHand*2);
        }
        else if(dealerIsBust){
            resultsString += "The House bust! You win! ";
                this.payoutWinnings(betAmountForHand*2);
        }
        else
            resultsString += "The House wins. ";

        
        if(this.insuranceTaken){
            if(dealerHasBlackjack){
                resultsString += "<br>Your insurance paid out. ";
                this.payoutInsurance();
            }
            else {
                if(this.hasSplit)
                    this.splitAndInsuranceFlopped = true;
                else
                    resultsString += "<br>Your insurance flopped. ";
            }
        }
        
        this.hideInsuranceTakenIndicator();

        if(!this.hasSplit)
            this.showEndOfHandAnimation(resultsString);
        else if(this.firstHandResultsString == "")
            this.firstHandResultsString = resultsString;
        else {
            if(this.splitAndInsuranceFlopped)
                this.showEndOfHandAnimation("First hand: " + this.firstHandResultsString + "<br>Second hand: " + resultsString + "<br>Your insurance flopped.");
            else
                this.showEndOfHandAnimation("First hand: " + this.firstHandResultsString + "<br>Second hand: " + resultsString);
        }
    }

    hit(){
        this.hideDoubleDownButton();
        this.playerDrawsCard();

        if (User.checkBust(this.currentlySelectedHand))
            this.checkResults(this.currentlySelectedHand, this.betAmount);
    }

    stand(){
        if(this.currentlySelectedHand == this.player.hand)
            this.checkResults(this.player.hand, this.betAmount);
        else if(this.currentlySelectedHand == this.player.hand2)
            this.checkResults(this.player.hand2, this.splitBetAmount);
    }

    shiftFocusToSecondHand(){
        const hand1Div = document.getElementById("playersHand");
        const hand2Div = document.getElementById("playersHand2");

        hand1Div.className = "";
        hand2Div.className = "active-hand";

        this.currentlySelectedHand = this.player.hand2;
        this.currentlySelectedHandDiv = hand2Div;
    }

    doubleDown(){ // all the game and bankroll logic for when a player doubles down on their hand
        this.doubledDown = true;

        if(this.currentlySelectedHand == this.player.hand){
            this.player.bankroll -= this.betAmount;
            this.betAmount = this.betAmount*2;
        }
        else if(this.currentlySelectedHand == this.player.hand2){
            this.player.bankroll -= this.splitBetAmount;
            this.splitBetAmount = this.splitBetAmount*2;
        }

        this.player.updateLocalStorageBankroll();
        this.updateBankrollDisplay();
        this.updateBetAmountDisplay();

        this.playerDrawsCard();
        this.stand();
    }

    dealerPlays(){ // function deals to the dealer 
        let dealerHandValue = User.getHandValue(this.dealer.hand);

        const dealersHiddenCard = document.getElementById("dealers-hidden-card");
        dealersHiddenCard.id = "";

        if (!User.checkBust(this.dealer.hand)) // if the dealer is not bust and it will deal to themselvs until they have a hand value of at the 17
        {
            while(dealerHandValue < 17){
                this.dealerDrawsCard();
                dealerHandValue = User.getHandValue(this.dealer.hand);
                
                if(dealerHandValue > 21)
                    this.dealer.bust = true;
            }
        }
    }

    checkForBlackjack(handToCheckForBlackjack){
        return (handToCheckForBlackjack.length == 2) && (User.getHandValue(handToCheckForBlackjack) === 21);
    }

    playerSplits(){ // this function has all the game and bankroll logic for when a player splits their hand
        this.player.splitHand();
        this.hasSplit = true;
        this.hideSplitButton();
        this.splitBetAmount = this.betAmount; //bet for same amount
        this.player.bankroll -= this.splitBetAmount;
        this.player.updateLocalStorageBankroll();
        this.updateBankrollDisplay();

        const hand1Div = document.getElementById("playersHand");
        hand1Div.className += " active-hand";

        const hand2Div = document.getElementById("playersHand2");
        this.drawCardFromDeck(this.player.hand, hand1Div, false);
        this.drawCardFromDeck(this.player.hand2, hand2Div, false);

        this.renderHandsFromScratchAfterSplit();
    }

    renderHandsFromScratchAfterSplit(){ // when the user chooses to do the split move, this function will create the hmtl logic for showing 2 hands being played instead of one large one
        const hand1Div = document.getElementById("playersHand");
        const hand2Div = document.getElementById("playersHand2");

        hand1Div.innerHTML = "";
        hand2Div.innerHTML = "";

        hand2Div.style.display = "flex";

        for(let card of this.player.hand) {
            let cardIsRed = ((card.suit === '♥') || (card.suit === '♦'));
            let suitAndValue = "" + card.suit + card.value;
            let HTMLforCard = "";

            if (cardIsRed)
                HTMLforCard = "<div class=\"card-show card-is-red\">" + suitAndValue + "</div>";
            else
                HTMLforCard = "<div class=\"card-show\">" + suitAndValue + "</div>";

            hand1Div.innerHTML = hand1Div.innerHTML + HTMLforCard;
        }

        for(let card of this.player.hand2) {
            let cardIsRed = ((card.suit === '♥') || (card.suit === '♦'));
            let suitAndValue = "" + card.suit + card.value;
            let HTMLforCard = "";

            if (cardIsRed)
                HTMLforCard = "<div class=\"card-show card-is-red\">" + suitAndValue + "</div>";
            else
                HTMLforCard = "<div class=\"card-show\">" + suitAndValue + "</div>";

            hand2Div.innerHTML = hand2Div.innerHTML + HTMLforCard;
        }
    }

    takeInsurance(){ // this function handles the bankroll logic for when a player takes insurance on a hand
        this.hideInsuranceButton();
        this.showInsuranceTakenIndicator();
        
        this.insuranceTaken = true;
        this.insuranceBetAmount = this.betAmount/2;
        this.player.bankroll -= this.insuranceBetAmount;
        
        this.player.updateLocalStorageBankroll();
        this.updateBankrollDisplay();
    }

    gameTip(){
        if(this.showTips){ // this function will take into account the users hand/s and will show a tip on what move they should take
            if(this.dealerHasFaceUpAce()){
                    this.sendTextToTipPopup("In games with 4 or more decks Dont take insurance this is not worth it. In a single game deck like this, the odds are more in your favour so you can take it. Remember, it is not smart to double against an ace, just hit if your below 17.");    
                    //this.sendTextToTipPopup("In a single game deck like this, the odds are more in your favour so you can take it."); 
                    //this.sendTextToTipPopup("Remember, it is not smart to double against an ace, just hit if your below 17."); 
            }
            else if(this.dealer.hand[0].intValue > 6 && this.dealer.hand[0].intValue  < 11 ) 
            {
                if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() > 16)
                    this.sendTextToTipPopup("You should stand.");
                else if (this.player.hand[0].numericValue() + this.player.hand[1].numericValue() === 16)
                {
                    if(this.player.hand[0].numericValue() === 11 || this.player.hand[1].numericValue() === 11)
                        this.sendTextToTipPopup("Not a good position, but your best play is to take a card.");
                    else if(this.player.hand[0].value === this.player.hand[1].value) 
                        this.sendTextToTipPopup("Never split on a pair of 5s, 10s Js, Qs or Ks");        
                    else
                        this.sendTextToTipPopup("Not a good position, but your best play is to stand.");
                }
                else if (this.player.hand[0].numericValue() + this.player.hand[1].numericValue() > 11 && this.player.hand[0].numericValue() + this.player.hand[1].numericValue() < 16 )
                {
                    this.sendTextToTipPopup("Not a good position, but your best play is to take a card.");
                        
                    if(this.player.hand[0].value === this.player.hand[1].value) 
                        this.sendTextToTipPopup("Never split on a pair of 5s, 10s Js, Qs or Ks"); // This advice should be given anywhere there is a pair *********
                }
                else if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() === 11)
                    this.sendTextToTipPopup("You shouldn't double down while the dealer has a 7 or above, just take a card.");
                else if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() === 10)
                {
                    this.sendTextToTipPopup("Do not double down, while the dealer has a 7 or above, just take a card.");
                    if(this.player.hand[0].value === this.player.hand[1].value)
                            this.sendTextToTipPopup("Never split on a pair of 5s, 10s Js, Qs or Ks"); // This advice should be given anywhere there is a pair *********
                }
                else if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() === 9)
                    this.sendTextToTipPopup("Do not double down, while the dealer has a 7 or above, just take a card.");
                else if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() === 8)
                {
                    this.sendTextToTipPopup("Do not double down, while the dealer has a 7 or above, just take a card.");
                    
                    if(this.player.hand[0].value === this.player.hand[1].value) 
                            this.sendTextToTipPopup("Never split on a pair of 5s, 10s Js, Qs or Ks"); // This advice should be given anywhere there is a pair *********
                }
                else if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() < 8)
                {
                    this.sendTextToTipPopup("While the dealer has a 7 or above, just take a card.");
                    
                    if(this.player.hand[0].value === this.player.hand[1].value) 
                            this.sendTextToTipPopup("Never split on a pair of 5s, 10s Js, Qs or Ks"); // This advice should be given anywhere there is a pair *********
                }                  
                else if(this.player.hand[0].value === this.player.hand[1].value) 
                    this.sendTextToTipPopup("Never split on a pair of 5s, 10s Js, Qs or Ks"); // This advice should be given anywhere there is a pair *********
                else if(this.player.hand[0].numericValue() === 11 || this.player.hand[1].numericValue() === 11) 
                    this.sendTextToTipPopup("Dealers hand is too strong to risk a double down, if the face up card was weaker this would be an ideal hand to double."); // This needs to be adjusted so if player has BJ we dont give this advice
            }
            else if (this.dealer.hand[0].intValue < 7)
            {
                if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() > 16)
                    this.sendTextToTipPopup("You should stand.");
                else if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() === 11)
                    this.sendTextToTipPopup("You should double down");
                else if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() > 17)
                {
                    if(this.player.hand[0].value === this.player.hand[1].value) 
                    {    
                        this.sendTextToTipPopup("Never split on a pair of 5s, 10s Js, Qs or Ks");
                    }
                    else
                    {
                        this.sendTextToTipPopup("You should stand."); 
                    }                                            
                }                       
                else if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() > 11 && this.player.hand[0].numericValue() + this.player.hand[1].numericValue() < 16)
                {
                    if(this.player.hand[0].numericValue() === 11 || this.player.hand[1].numericValue() === 11) 
                    {
                    this.sendTextToTipPopup("If you have a second card ranging from 2 to 7, double down.");
                    }
                    else
                    {
                        this.sendTextToTipPopup("You should stand."); 
                    }
                }   
                else if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() === 10)
                    this.sendTextToTipPopup("You should double down");
                else if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() === 9)
                    this.sendTextToTipPopup("You should double down");
                else if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() === 8)
                    this.sendTextToTipPopup("You should double down");
                else if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() < 8)
                    this.sendTextToTipPopup("You should hit");
                //this.player.hand[0].numericValue()  === this.player.hand[1].numericValue()
                else if(this.player.hand[0].value === this.player.hand[1].value) 
                    this.sendTextToTipPopup("Never split on a pair of 5s, 10s Js, Qs or Ks"); // This advice should be given anywhere there is a pair *********
                else if(this.player.hand[0].numericValue() === 11 || this.player.hand[1].numericValue() === 11) 
                {
                    this.sendTextToTipPopup("If you have a second card ranging from 2 to 7, double down.");  // This needs to be adjusted so if player has BJ we dont give this advice
                        
                    if(this.player.hand[0].numericValue() + this.player.hand[1].numericValue() >= 19 )
                        this.sendTextToTipPopup("You should stand.");
                }
                else
                    this.sendTextToTipPopup("Testing Testing");
            }    
            else {
                if(this.player.hand[0].value === this.player.hand[1].value)
                    this.sendTextToTipPopup("Never split on a pair of 5s, 10s Js, Qs or Ks");
                else
                    this.sendTextToTipPopup("Testing Testing");
            }
        }
    }

    sendTextToTipPopup(tipString){
        const tipPopup = document.getElementById("tipPopup");
        const tipPopupContainer = document.getElementById("tip-popup-window");

        tipPopup.innerHTML = tipString;
        tipPopupContainer.style.display = "block";
        tipPopupContainer.style.animation = "fadeIn 1s";

        setTimeout(function() {tipPopupContainer.style.animation = "fadeOut 1s"; }, 4000);
        
        setTimeout(function() {tipPopupContainer.style.display = "none";}, 5000);
    }

    toggleTipsPopUp(){ // in the menu whilst in game, there is an option to turn off or on the adivse pop up boxes based on your hand
        let onOrOffText = document.getElementById("toggleTipsOnOrOffText");

        if(this.showTips){
            onOrOffText.innerHTML = "on";
            this.showTips = false;
        }
        else if(!this.showTips) {
            onOrOffText.innerHTML = "off";
            this.showTips = true;
        }
    }

    ////////// GUI METHODS //////////
    showInsuranceTakenIndicator(){
        document.getElementById("insurance-taken-visual-indicator").style.visibility = "visible";
    }

    hideInsuranceTakenIndicator(){
        document.getElementById("insurance-taken-visual-indicator").style.visibility = "hidden";
    }
    
    showEndOfHandAnimation(resultsString){
        document.getElementById("resultsBox").style.display = 'block';
        document.getElementById("results-text").innerHTML = resultsString;
    }

    hideEndOfHandAnimation(){
        document.getElementById("resultsBox").style.display = 'none';
    }

    updateBetAmountButton(){
        document.getElementById("currentBetAmountH3").innerHTML = this.betAmount;
    }

    updateBankrollDisplay(){
        document.getElementById("current-bank-roll").innerHTML = this.player.bankroll;
    }
    
    updateBetAmountDisplay(){
        document.getElementById("current-bet-amount").innerHTML = this.betAmount + this.splitBetAmount;
    }

    showBettingControls(){
        const bettingControls = document.getElementById("bettingControls");

        this.updateBetAmountButton();
        this.updateBetAmountDisplay();

        bettingControls.style.display = "block";
    }

    hideSplitButton(){
        document.getElementById("split-btn").style.display = "none";
    }

    hideDoubleDownButton(){
        document.getElementById("double-btn").style.display = "none";
    }

    showSplitButton(){
        document.getElementById("split-btn").style.display = "inline";
    }

    showDoubleDownButton(){
        document.getElementById("double-btn").style.display = "inline";
    }

    showInsuranceButton(){
        document.getElementById("insurance-btn").style.display = "inline";
    }

    hideInsuranceButton(){
        document.getElementById("insurance-btn").style.display = "none";
    }
    
    showActionControls(){ // this function will show the possible moves a player can take depending on what their and the dealers hand is
        const actionControls = document.getElementById("actionControls");
        let playerCanSplitButHasntYet = ((this.player.hand[0].value == this.player.hand[1].value) && ((this.player.bankroll - this.betAmount) > 0) && !this.hasSplit);
        let playerCanDoubleDown = this.betAmount <= this.player.bankroll;

        actionControls.style.display = "block";

        if(this.dealerHasFaceUpAce())
            this.showInsuranceButton();

        if(playerCanSplitButHasntYet)
            this.showSplitButton();

        if(playerCanDoubleDown)
            this.showDoubleDownButton();
    }
    
    hideBettingControls(){
        document.getElementById("bettingControls").style.display = "none";
    }
    
    hideActionControls(){
        document.getElementById("actionControls").style.display = "none";
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
}

class User{
    constructor() {
        this.hand = [];
        this.bankroll = 1000;
        this.bust = false;
        this.hand2 = [];
    }
    
    clearHand(){
        this.hand = [];
        this.hand2 = [];
    }

    static getHandValue(handToCalculateValueFor){
        let tempHandValue = 0;      
        let arrayOfCardIntValues = [];
        let numberOfAces = 0;

        for (let card of handToCalculateValueFor) { // calculates how many aces are in the hand
            if (card.intValue != 11)
                tempHandValue += card.intValue;
            else
                numberOfAces++;
        }
        
        //logic that checks for how many aces a hand has and if each one should be counted as an 11 or a 1
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

    splitHand() { // when the player has they can choose to split, this function divides the hand into two
        const cardToAddToHand2 = this.hand.slice(-1);
        this.hand2.push(cardToAddToHand2[0]);
        this.hand.pop(cardToAddToHand2[0]);
    }

    static checkBust(handToCheck){
        return User.getHandValue(handToCheck) > 21;
    }

    setBankrollFromLocalStorage(){ // when the page is refreshed this function will retrieve the bankroll from local storage and save it as the players bankroll for the current game
        this.bankroll = localStorage.getItem('bankroll');
    }

    updateLocalStorageBankroll(){ // when the bankroll has incresed or decreased this function will save the integer in the local storage to be used when the page is refreshed
        localStorage.setItem('bankroll', this.bankroll);
    }
}

class Deck{
    constructor(){
         this.cards = this.resetDeck();
    }

    resetDeck(){ // this resets the deck after ever hand by making the deck an empty array then repopulating it will all 52 cards
        this.cards = [];
        for (let suit of SUITS) {
            for (let value of VALUES) {
                let cardToAdd = new Card(suit, value);
                this.cards.push(cardToAdd);
            }
        }
    }

    drawCard(){ // this function is called anytime the player or dealer take a card, it returns the top card on the deck
        const cardsDrawn = this.cards.slice(-1);
        this.cards = this.cards.slice(0, -1);
        return cardsDrawn;
    }

    deckSize(){ // returns the size of the deck
         return this.cards.length;
    }

    shuffle(){ // every time the deck is shuffles at the start of each game this function is called
        for(let i = this.deckSize() - 1; i > 0; i--){
            const newLocation = Math.floor(Math.random() * (i + 1)); //Random location before the card we are on
            const oldCard = this.cards[newLocation]; // Switched the card we are currently on with new card at the random location
            this.cards[newLocation] = this.cards[i];
            this.cards[i] = oldCard;
        }
    }
 }

class Card{
    constructor(suit, value){ // each card object has an attreibute of a suit and a value
        this.suit = suit;
        this.value = value;
        this.intValue = this.numericValue();
        this.aceValueOf11 = true;
    }

    numericValue(){ // function returns the numereic value of a card, if its a picture card 10 is returned, ace - 11, other than that the numeric value is just the value of the card
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

const checkOnlineStatus = async () => { // this function controls the online/offline api to simulate being connected to the internet
    try {
      const online = await fetch("https://bet.sbgcdn.com/content/cadmin/700f32ed29c1554daddeb32776c4aa04.jpg", {cache: "no-store"});
      return online.status >= 200 && online.status < 300; // either true or false
    } catch (err) {
        return false; // definitely offline
    }
  };

setInterval(async () =>{ // this function will check the online/offline status every 60 seconds
    const connected = await checkOnlineStatus();
    displayRedirectPopUp(connected); // if the user is online, a popup with a button taking you to the skybet website will appear
}, 60000);

function displayRedirectPopUp(connection){
    if (connection && remindMe) { // checksif they're online and haven't selected the do not remind me again check box, if both are true the pop up shows
        const popUp = document.getElementById("status-popup");
        popUp.style.display = "block";
    }
}

function hideRedirectPopUp(){ // hides the online connected popup shown to the user
    const popUp = document.getElementById("status-popup");
    popUp.style.display = "none";
}

function redirectToSkyBet(){ 
    window.location.href = "https://m.skybet.com/";
}

function setRemindMeAboutRedirect(){ // when the pop up shows, there a check box the user can select to block the pop up from showing
    const checkbox = document.getElementById("remind-checkbox");
    remindMe = !checkbox.checked;
}

function startGame(){ // when the button to start a new game this function will start the music, hide the home screen buttons and call a function shoing the betting controls
    startAudioLoopAndSetVolume();
    document.getElementById("overlay").style.display = "none";
    document.getElementById("dealer-text").innerHTML = "Dealer";
    blackjackGame.clearHandAndAwaitUserBet();
}

function startAudioLoopAndSetVolume(){
    const gameAudio = document.getElementById("gameSound");
    gameAudio.loop = true;
    gameAudio.volume = 0.0;
    gameAudio.play();
}

function toggleSound(){ // wd hen the mute button is pressed it will toggle either muting or unmuting the music and change the image of the button to match
    var gameAudio = document.getElementById("gameSound");
    var audioButton = document.getElementById("sound-button-img");

    if(gameAudio.muted)
    {
        gameAudio.muted = false;
        audioButton.src = "./CSS/pinkSoundOn.png";
    }
    else
    {
        gameAudio.muted = true;
        audioButton.src = "./CSS/pinkSoundOff.png";
    }
}

function newGame(){
  document.getElementById("overlay").style.display = "none";
}

function tutorialMode(){ // on the home page when the tips n tricks is pressed this function will show the text
    document.getElementById("tips-blur").style.display = "block";
}

function exitPage(){ // hides tips n tricks page
    var tipsBox = document.getElementById("tips-blur");
    tipsBox.style.display = "none";
}

function rulesMode(){ // on the home page when the rules are pressed this function will show the text
    document.getElementById("rules-blur").style.display = "block";
}

function exitRulesPage(){ // hides rules page
    var rulesBox = document.getElementById("rules-blur");
    rulesBox.style.display = "none";
}

//global objects, variables and event listener for page load
var blackjackGame = new Game();
var remindMe = true;
window.addEventListener("load", async (event) => {displayRedirectPopUp(await checkOnlineStatus());});