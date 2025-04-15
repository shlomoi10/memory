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
        
        // פופאפ ניחוש הקלף השלישי
        this.popupOverlay = document.getElementById('third-card-popup');
        this.popupBoard = document.getElementById('popup-board');
        
        // מערך הקבוצות הייחודיות בפופאפ (יאותחל בתחילת המשחק)
        this.popupUniqueGroups = [];
        
        // אתחול המשחק
        this.resetGame();
    }
    
    /**
     * אתחול לוח המשחק
     */
    initializeBoard() {
        const size = this.boardSize[this.difficulty];
        const totalCards = size * size;
        
        // חישוב מספר הקבוצות (כל קבוצה מכילה 3 קלפים זהים)
        const groupsCount = Math.floor(totalCards / 3);
        
        // בחירת קבוצות אקראיות לפי מספר הקבוצות הנדרש
        const selectedGroups = this.shuffleArray(this.cardData).slice(0, groupsCount);
        
        // יצירת מערך של קלפים (3 קלפים מכל קבוצה)
        let cardValues = [];
        selectedGroups.forEach(card => {
            // יצירת 3 קלפים זהים מכל קבוצה
            for (let i = 0; i < 3; i++) {
                cardValues.push({ ...card });
            }
        });
        
        // אם יש מקום לעוד קלפים (כי totalCards לא מתחלק ב-3)
        const remainingSlots = totalCards - cardValues.length;
        if (remainingSlots > 0) {
            // בחירת קבוצה נוספת
            const extraGroup = this.cardData.find(card => !selectedGroups.includes(card));
            
            // הוספת קלפים מהקבוצה הנוספת כדי למלא את הלוח
            for (let i = 0; i < remainingSlots; i++) {
                cardValues.push({ ...extraGroup });
            }
        }
        
        // ערבוב הקלפים
        cardValues = this.shuffleArray(cardValues);
        
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
        // איסוף כל הקבוצות הייחודיות מהלוח
        const uniqueGroups = [];
        const groupsMap = new Map();
        
        this.originalCardValues.forEach(card => {
            if (!groupsMap.has(card.group)) {
                groupsMap.set(card.group, card);
                uniqueGroups.push({ ...card });
            }
        });
        
        // ערבוב הקבוצות הייחודיות
        this.popupUniqueGroups = this.shuffleArray(uniqueGroups);
    }
    
    /**
     * בדיקת התאמה בין שני קלפים
     */
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const cardData1 = JSON.parse(card1.dataset.value);
        const cardData2 = JSON.parse(card2.dataset.value);
        
        if (cardData1.group === cardData2.group) {
            // התאמה נמצאה - סימון הקלפים כמתאימים
            this.markAsMatched();
            
            // שמירת הקבוצה של הזוג שנמצא
            this.lastMatchedGroup = cardData1.group;
            
            // הצגת פופאפ לניחוש הקלף השלישי
            setTimeout(() => {
                this.showThirdCardPopup();
            }, 500);
            
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
     * הצגת פופאפ לניחוש הקלף השלישי
     */
    showThirdCardPopup() {
        // ניקוי לוח הפופאפ
        while (this.popupBoard.firstChild) {
            this.popupBoard.removeChild(this.popupBoard.firstChild);
        }
        
        // הגדרת גריד לפי מספר הקבוצות הייחודיות
        const gridSize = Math.ceil(Math.sqrt(this.popupUniqueGroups.length));
        this.popupBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        // יצירת קלפים בפופאפ (אחד מכל קבוצה)
        for (let i = 0; i < this.popupUniqueGroups.length; i++) {
            const cardData = this.popupUniqueGroups[i];
            
            // יצירת קלף בפופאפ
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = i;
            card.dataset.group = cardData.group;
            
            // הוספת מאזין אירועים לניחוש
            card.addEventListener('click', () => this.guessThirdCard(card));
            
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
        } else {
            resultElement.textContent = 'ניחוש שגוי!';
        }
        
        // הוספת התוצאה לפופאפ
        const popupContent = this.popupOverlay.querySelector('.popup-content');
        
        // הסרת תוצאה קודמת אם קיימת
        const existingResult = popupContent.querySelector('.popup-result');
        if (existingResult) popupContent.removeChild(existingResult);
        
        // הסרת כפתור קודם אם קיים
        const existingButton = popupContent.querySelector('.popup-continue-btn');
        if (existingButton) popupContent.removeChild(existingButton);
        
        popupContent.appendChild(resultElement);
        
        // סגירת הפופאפ אוטומטית אחרי השהייה קצרה
        setTimeout(() => {
            this.hideThirdCardPopup();
            
            // אם הניחוש היה שגוי, החלפת תור
            if (!isCorrect) {
                this.switchPlayer();
            }
        }, 1500); // השהייה של 1.5 שניות כדי לאפשר לשחקן לראות את התוצאה
    }
    
    /**
     * הסתרת פופאפ ניחוש הקלף השלישי
     */
    hideThirdCardPopup() {
        this.popupOverlay.classList.remove('visible');
        
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
    }
}

// יצירת אובייקט המשחק והפעלתו
document.addEventListener('DOMContentLoaded', () => {
    new TripleMemoryGame();
});
