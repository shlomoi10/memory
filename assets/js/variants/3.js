/**
 * משחק זיכרון משולש - מצא זוגות ואז נחש את הקלף השלישי
 * במשחק זה, אחרי מציאת זוג, השחקן צריך לנחש היכן נמצא הקלף השלישי
 * ניחוש נכון מזכה בנקודה נוספת, ניחוש שגוי גורם לאיבוד התור
 */
class TripleMemoryGame extends BaseMemoryGame {
    constructor() {
        super({
            boardSelector: '#memory-board',
            difficultySelector: '.difficulty-btn',
            statsSelector: '.game-stats',
            messageSelector: '#game-message'
        });
        
        // נתוני קלפים עם אימוג'י
        this.cardData = [
            { symbol: '🐶', group: 1 },
            { symbol: '🐱', group: 2 },
            { symbol: '🐭', group: 3 },
            { symbol: '🐹', group: 4 },
            { symbol: '🐰', group: 5 },
            { symbol: '🦊', group: 6 },
            { symbol: '🐻', group: 7 },
            { symbol: '🐼', group: 8 },
            { symbol: '🐨', group: 9 },
            { symbol: '🐯', group: 10 },
            { symbol: '🦁', group: 11 },
            { symbol: '🐮', group: 12 },
            { symbol: '🐷', group: 13 },
            { symbol: '🐸', group: 14 },
            { symbol: '🐵', group: 15 },
            { symbol: '🐔', group: 16 },
            { symbol: '🐧', group: 17 },
            { symbol: '🐦', group: 18 },
            { symbol: '🐤', group: 19 },
            { symbol: '🦆', group: 20 },
            { symbol: '🦉', group: 21 },
            { symbol: '🦇', group: 22 },
            { symbol: '🐺', group: 23 },
            { symbol: '🐗', group: 24 },
            { symbol: '🐴', group: 25 },
            { symbol: '🦄', group: 26 },
            { symbol: '🐝', group: 27 },
            { symbol: '🐛', group: 28 },
            { symbol: '🦋', group: 29 },
            { symbol: '🐌', group: 30 },
            { symbol: '🐞', group: 31 },
            { symbol: '🐜', group: 32 }
        ];
        
        // נתוני שחקנים
        this.players = [
            { name: 'שחקן 1', score: 0, element: document.querySelector('.player-1') },
            { name: 'שחקן 2', score: 0, element: document.querySelector('.player-2') }
        ];
        
        this.currentPlayerIndex = 0;
        this.turnChanged = false;
        
        // מידע על הזוג האחרון שנמצא
        this.lastMatchedGroup = null;
        this.lastMatchedSymbol = null;
        
        // פופאפ ניחוש הקלף השלישי
        this.popupOverlay = document.getElementById('third-card-popup');
        this.popupBoard = document.getElementById('popup-board');
        
        // מערך הקבוצות הייחודיות בפופאפ (יאותחל בתחילת המשחק)
        this.popupUniqueGroups = [];
        
        // אתחול המשחק
        this.resetGame();
        
        // קלפים שנמצאו כזוג זמני (לא מסומנים כמתאימים עדיין)
        this.tempMatchedCards = [];
        
        // קבוצות שנבחרו למשחק
        this.gameGroups = [];
    }
    
    /**
     * אתחול לוח המשחק
     */
    initializeBoard() {
        const size = this.boardSize[this.difficulty];
        const totalCards = size * size;
        
        // מספר הזוגות הוא מחצית ממספר הקלפים
        const pairsCount = totalCards / 2;
        
        // ערבוב מערך הקלפים המקורי לפני בחירת הקלפים
        const shuffledCardData = this.shuffleArray([...this.cardData]);
        
        // בחירת קבוצות אקראיות לפי מספר הזוגות הנדרש
        // ניקח רק pairsCount קבוצות כדי שלא יהיו כפילויות
        const selectedGroups = shuffledCardData.slice(0, pairsCount);
        
        // שמירת הקבוצות שנבחרו למשחק (נשתמש בהן גם בפופאפ)
        this.gameGroups = [...selectedGroups];
        
        // יצירת מערך של זוגות (כל קבוצה מופיעה פעמיים)
        let cardValues = [];
        selectedGroups.forEach(card => {
            // יצירת 2 קלפים זהים מכל קבוצה
            for (let i = 0; i < 2; i++) {
                cardValues.push({ ...card });
            }
        });
        
        // ערבוב הקלפים באמצעות אלגוריתם Fisher-Yates משופר
        cardValues = this.betterShuffle(cardValues);
        
        // שמירת מערך הקלפים המקורי לשימוש בפופאפ
        this.originalCardValues = [...cardValues];
        
        // הגדרת גריד לפי גודל הלוח
        this.boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        
        // יצירת הקלפים
        for (let i = 0; i < totalCards; i++) {
            const card = this.createCard(i, JSON.stringify(cardValues[i]));
            this.boardElement.appendChild(card);
            this.cards.push(card);
            
            // הוספת הסמל לצד הקדמי של הקלף
            const frontSide = card.querySelector('.front');
            const cardData = cardValues[i];
            
            // יצירת מבנה הקלף עם אימוג'י
            frontSide.innerHTML = `
                <div class="card-symbol">${cardData.symbol}</div>
            `;
        }
        
        // איפוס נתוני שחקנים
        this.players.forEach(player => {
            player.score = 0;
            this.updatePlayerScore(player);
        });
        
        // עדכון השחקן הנוכחי
        this.currentPlayerIndex = 0;
        this.updateCurrentPlayer();
        
        // יצירת מערך הקבוצות הייחודיות לפופאפ
        this.createUniquePopupGroups();
    }
    
    /**
     * יצירת מערך קבוצות ייחודיות לפופאפ
     */
    createUniquePopupGroups() {
        // השתמש בקבוצות שנבחרו למשחק
        const uniqueGroups = [...this.gameGroups];
        
        // ערבוב הקבוצות הייחודיות באמצעות אלגוריתם Fisher-Yates משופר
        this.popupUniqueGroups = this.betterShuffle(uniqueGroups);
        
        console.log(`מספר הקלפים בפופאפ: ${this.popupUniqueGroups.length}`);
    }
    
    /**
     * ערבוב מערך באמצעות אלגוריתם Fisher-Yates משופר
     */
    betterShuffle(array) {
        const newArray = [...array]; // יצירת עותק של המערך המקורי
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    /**
     * בדיקת התאמה בין שני קלפים
     */
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const cardData1 = JSON.parse(card1.dataset.value);
        const cardData2 = JSON.parse(card2.dataset.value);
        
        if (cardData1.group === cardData2.group) {
            // שמירת הקבוצה של הזוג שנמצא
            this.lastMatchedGroup = cardData1.group;
            this.lastMatchedSymbol = cardData1.symbol;
            
            // שמירת הקלפים שנמצאו כזוג זמני (לא מסומנים כמתאימים עדיין)
            this.tempMatchedCards = [...this.flippedCards];
            this.flippedCards = [];
            
            // הצגת פופאפ לניחוש הקלף השלישי אחרי השהייה קצרה
            setTimeout(() => {
                this.showThirdCardPopup();
            }, 300);
            
            // השחקן הנוכחי ממשיך לשחק (לא מחליפים תור)
            this.turnChanged = false;
        } else {
            // אין התאמה, החזרת הקלפים והחלפת תור
            this.resetFlippedCards();
            this.turnChanged = true;
            
            // החלפת תור לשחקן הבא
            setTimeout(() => {
                this.switchPlayer();
            }, 1100); // קצת יותר מזמן ההיפוך של הקלפים
        }
    }
    
    /**
     * סימון זוג קלפים כמתאימים (שונה ממחלקת הבסיס כדי להשאיר אותם מוצגים)
     */
    markCardsAsMatched() {
        this.flippedCards.forEach(card => {
            card.classList.add('matched');
            
            // הסרת מאזין האירועים מהקלף
            card.style.pointerEvents = 'none';
        });
        
        this.matchedPairs++;
        this.flippedCards = [];
        
        // בדיקה האם המשחק הסתיים
        this.checkGameCompletion();
    }
    
    /**
     * הצגת פופאפ לניחוש הקלף השלישי
     */
    showThirdCardPopup() {
        // ניקוי לוח הפופאפ
        while (this.popupBoard.firstChild) {
            this.popupBoard.removeChild(this.popupBoard.firstChild);
        }
        
        // עדכון כותרת הפופאפ עם האימוג'י שצריך למצוא
        const popupTitle = this.popupOverlay.querySelector('.popup-title');
        popupTitle.innerHTML = `מצא את <span class="target-symbol">${this.lastMatchedSymbol}</span>`;
        
        // עדכון הטקסט המסביר
        const popupText = this.popupOverlay.querySelector('.popup-text');
        popupText.textContent = 'נחש היכן נמצא הקלף השלישי';
        
        // הסרת תוצאה קודמת אם קיימת
        const popupContent = this.popupOverlay.querySelector('.popup-content');
        const existingResult = popupContent.querySelector('.popup-result');
        if (existingResult) popupContent.removeChild(existingResult);
        
        // הגדרת גריד לפי מספר הקבוצות הייחודיות
        const gridSize = Math.ceil(Math.sqrt(this.popupUniqueGroups.length));
        this.popupBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        // משתנה לסימון האם כבר נלחץ קלף בפופאפ
        this.popupCardClicked = false;
        
        // יצירת קלפים בפופאפ (אחד מכל קבוצה)
        for (let i = 0; i < this.popupUniqueGroups.length; i++) {
            const cardData = this.popupUniqueGroups[i];
            
            // יצירת קלף בפופאפ
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = i;
            card.dataset.group = cardData.group;
            
            // הוספת מאזין אירועים לניחוש
            card.addEventListener('click', () => {
                // בדיקה האם כבר נלחץ קלף בפופאפ
                if (this.popupCardClicked) return;
                
                // סימון שנלחץ קלף
                this.popupCardClicked = true;
                
                // ניחוש הקלף
                this.guessThirdCard(card);
            });
            
            // הוספת צדדים לקלף
            const front = document.createElement('div');
            front.className = 'front';
            front.innerHTML = `<div class="card-symbol">${cardData.symbol}</div>`;
            
            const back = document.createElement('div');
            back.className = 'back';
            
            card.appendChild(front);
            card.appendChild(back);
            
            this.popupBoard.appendChild(card);
        }
        
        // הצגת הפופאפ
        this.popupOverlay.classList.add('visible');
    }
    
    /**
     * ניחוש הקלף השלישי
     * @param {HTMLElement} card - הקלף שנבחר
     */
    guessThirdCard(card) {
        const cardGroup = parseInt(card.dataset.group);
        const isCorrect = cardGroup === this.lastMatchedGroup;
        
        // הפיכת הקלף שנבחר
        card.classList.add('flipped');
        
        // יצירת אלמנט להצגת התוצאה
        const resultElement = document.createElement('div');
        resultElement.className = `popup-result ${isCorrect ? 'success' : 'failure'}`;
        
        if (isCorrect) {
            resultElement.textContent = 'ניחוש נכון!';
            
            // הוספת נקודה לשחקן הנוכחי
            const currentPlayer = this.players[this.currentPlayerIndex];
            currentPlayer.score++;
            this.updatePlayerScore(currentPlayer);
            
            // סימון הקלפים הזמניים כמתאימים
            this.tempMatchedCards.forEach(card => {
                card.classList.add('matched');
                card.style.pointerEvents = 'none';
            });
            this.matchedPairs++;
        } else {
            resultElement.textContent = 'ניחוש שגוי!';
        }
        
        // הוספת התוצאה לפופאפ
        const popupContent = this.popupOverlay.querySelector('.popup-content');
        
        // הסרת תוצאה קודמת אם קיימת
        const existingResult = popupContent.querySelector('.popup-result');
        if (existingResult) popupContent.removeChild(existingResult);
        
        popupContent.appendChild(resultElement);
        
        // סגירת הפופאפ אוטומטית אחרי השהייה קצרה
        setTimeout(() => {
            this.hideThirdCardPopup();
            
            // אם הניחוש היה שגוי, החזרת הקלפים והחלפת תור
            if (!isCorrect) {
                // החזרת הקלפים הזמניים למצב מכוסה
                this.tempMatchedCards.forEach(card => {
                    card.classList.remove('flipped');
                });
                this.tempMatchedCards = [];
                
                // החלפת תור לשחקן הבא
                this.switchPlayer();
            } else {
                // ניקוי מערך הקלפים הזמניים
                this.tempMatchedCards = [];
                
                // בדיקה האם המשחק הסתיים
                this.checkGameCompletion();
            }
        }, 1000); // השהייה של 1 שניות כדי לאפשר לשחקן לראות את התוצאה
    }
    
    /**
     * הסתרת פופאפ ניחוש הקלף השלישי
     */
    hideThirdCardPopup() {
        this.popupOverlay.classList.remove('visible');
        
        // הסרת תוצאת הניחוש מהפופאפ
        const popupContent = this.popupOverlay.querySelector('.popup-content');
        const existingResult = popupContent.querySelector('.popup-result');
        if (existingResult) popupContent.removeChild(existingResult);
        
        // איפוס משתנה הלחיצה על קלף בפופאפ
        this.popupCardClicked = false;
        
        // בדיקה האם המשחק הסתיים
        this.checkGameCompletion();
    }
    
    /**
     * החלפת תור לשחקן הבא
     */
    switchPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.updateCurrentPlayer();
    }
    
    /**
     * עדכון תצוגת השחקן הנוכחי
     */
    updateCurrentPlayer() {
        // עדכון תצוגת התור
        const currentPlayerDisplay = document.querySelector('.stat-value[data-stat="current-player"]');
        if (currentPlayerDisplay) {
            currentPlayerDisplay.textContent = this.players[this.currentPlayerIndex].name;
        }
        
        // עדכון הדגשת השחקן הפעיל
        this.players.forEach((player, index) => {
            if (index === this.currentPlayerIndex) {
                player.element.classList.add('active');
            } else {
                player.element.classList.remove('active');
            }
        });
    }
    
    /**
     * עדכון תצוגת הניקוד של שחקן
     */
    updatePlayerScore(player) {
        const scoreElement = player.element.querySelector('.player-score');
        if (scoreElement) {
            scoreElement.textContent = `${player.score} נקודות`;
        }
    }
    
    /**
     * הצגת הודעת סיום משחק
     */
    showCompletionMessage() {
        // מציאת המנצח (השחקן עם הניקוד הגבוה ביותר)
        let winner = this.players[0];
        let isDraw = false;
        
        for (let i = 1; i < this.players.length; i++) {
            if (this.players[i].score > winner.score) {
                winner = this.players[i];
                isDraw = false;
            } else if (this.players[i].score === winner.score) {
                isDraw = true;
            }
        }
        
        const messageTitle = this.messageElement.querySelector('.message-title');
        const messageText = this.messageElement.querySelector('.message-text');
        
        messageTitle.textContent = 'המשחק הסתיים!';
        
        if (isDraw) {
            messageText.textContent = `תיקו! כל השחקנים צברו ${winner.score} נקודות`;
        } else {
            messageText.textContent = `המנצח: ${winner.name} עם ${winner.score} נקודות`;
        }
        
        this.messageElement.classList.add('visible');
    }
    
    /**
     * איפוס המשחק
     */
    resetGame() {
        super.resetGame();
        
        // איפוס נתוני שחקנים
        this.players.forEach(player => {
            player.score = 0;
            this.updatePlayerScore(player);
        });
        
        // איפוס השחקן הנוכחי
        this.currentPlayerIndex = 0;
        this.updateCurrentPlayer();
        this.turnChanged = false;
        
        // איפוס הקבוצה האחרונה שהותאמה
        this.lastMatchedGroup = null;
        this.lastMatchedSymbol = null;
        
        // איפוס קלפים זמניים
        this.tempMatchedCards = [];
        
        // איפוס קבוצות המשחק
        this.gameGroups = [];
    }
}

// יצירת אובייקט המשחק והפעלתו
document.addEventListener('DOMContentLoaded', () => {
    new TripleMemoryGame();
});
