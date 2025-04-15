/**
 * משחק זיכרון מספרים - מצא זוגות של קלפים זהים
 * במשחק זה, ניסיון שגוי צובר נקודות וניסיון מוצלח לא צובר נקודות
 * המטרה היא לצבור כמה שפחות נקודות
 */
class NumberMemoryGame extends BaseMemoryGame {
    constructor() {
        super({
            boardSelector: '#memory-board',
            difficultySelector: '.difficulty-btn',
            statsSelector: '.game-stats',
            messageSelector: '#game-message'
        });
        
        // נתוני קלפים עם מספרים, אימוג'י וניקוד
        this.cardData = [
            { symbol: '1️⃣', number: 1, points: 5 },
            { symbol: '2️⃣', number: 2, points: 10 },
            { symbol: '3️⃣', number: 3, points: 15 },
            { symbol: '4️⃣', number: 4, points: 20 },
            { symbol: '5️⃣', number: 5, points: 25 },
            { symbol: '6️⃣', number: 6, points: 30 },
            { symbol: '7️⃣', number: 7, points: 35 },
            { symbol: '8️⃣', number: 8, points: 40 },
            { symbol: '9️⃣', number: 9, points: 45 },
            { symbol: '🔟', number: 10, points: 50 },
            { symbol: '🌟', number: 11, points: 55 },
            { symbol: '💎', number: 12, points: 60 },
            { symbol: '🏆', number: 13, points: 65 },
            { symbol: '🎯', number: 14, points: 70 },
            { symbol: '🎮', number: 15, points: 75 },
            { symbol: '🎲', number: 16, points: 80 },
            { symbol: '🎪', number: 17, points: 85 },
            { symbol: '🎭', number: 18, points: 90 },
            { symbol: '🎨', number: 19, points: 95 },
            { symbol: '🎬', number: 20, points: 100 },
            { symbol: '📱', number: 21, points: 105 },
            { symbol: '💻', number: 22, points: 110 },
            { symbol: '🖥️', number: 23, points: 115 },
            { symbol: '📷', number: 24, points: 120 },
            { symbol: '🎵', number: 25, points: 125 },
            { symbol: '🎹', number: 26, points: 130 },
            { symbol: '🎸', number: 27, points: 135 },
            { symbol: '🎺', number: 28, points: 140 },
            { symbol: '🎻', number: 29, points: 145 },
            { symbol: '🥁', number: 30, points: 150 },
            { symbol: '🎤', number: 31, points: 155 },
            { symbol: '🎧', number: 32, points: 160 }
        ];
        
        // נתוני שחקנים
        this.players = [
            { name: 'שחקן 1', score: 0, element: document.querySelector('.player-1') },
            { name: 'שחקן 2', score: 0, element: document.querySelector('.player-2') }
        ];
        
        this.currentPlayerIndex = 0;
        this.turnChanged = false;
        
        // אתחול המשחק
        this.resetGame();
    }
    
    /**
     * אתחול לוח המשחק
     */
    initializeBoard() {
        const size = this.boardSize[this.difficulty];
        const totalCards = size * size;
        const pairsCount = totalCards / 2;
        
        // בחירת מספרים אקראיים לפי מספר הזוגות הנדרש
        const selectedCardData = this.shuffleArray(this.cardData).slice(0, pairsCount);
        
        // יצירת מערך של זוגות
        let cardValues = [];
        selectedCardData.forEach(card => {
            cardValues.push({ ...card });
            cardValues.push({ ...card });
        });
        
        // ערבוב הקלפים
        cardValues = this.shuffleArray(cardValues);
        
        // יצירת הקלפים
        for (let i = 0; i < totalCards; i++) {
            const card = this.createCard(i, JSON.stringify(cardValues[i]));
            this.boardElement.appendChild(card);
            this.cards.push(card);
            
            // הוספת המספר והניקוד לצד הקדמי של הקלף
            const frontSide = card.querySelector('.front');
            const cardData = cardValues[i];
            
            // יצירת מבנה הקלף עם אימוג'י וניקוד
            frontSide.innerHTML = `
                <div class="card-symbol">${cardData.symbol}</div>
                <div class="card-points">${cardData.points}</div>
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
    }
    
    /**
     * בדיקת התאמה בין שני קלפים
     */
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const cardData1 = JSON.parse(card1.dataset.value);
        const cardData2 = JSON.parse(card2.dataset.value);
        
        if (cardData1.number === cardData2.number) {
            // התאמה נמצאה - לא צוברים נקודות
            // סימון הקלפים כמתאימים
            this.markAsMatched();
            
            // השחקן הנוכחי ממשיך לשחק (לא מחליפים תור)
            this.turnChanged = false;
        } else {
            // אין התאמה - צוברים נקודות (סכום הנקודות של שני הקלפים)
            const currentPlayer = this.players[this.currentPlayerIndex];
            currentPlayer.score += (cardData1.points + cardData2.points);
            this.updatePlayerScore(currentPlayer);
            
            // החזרת הקלפים והחלפת תור
            this.resetFlippedCards();
            this.turnChanged = true;
            
            // החלפת תור לשחקן הבא
            setTimeout(() => {
                this.switchPlayer();
            }, 1100); // קצת יותר מזמן ההיפוך של הקלפים
        }
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
        // מציאת המנצח (השחקן עם הניקוד הנמוך ביותר)
        let winner = this.players[0];
        let isDraw = false;
        
        for (let i = 1; i < this.players.length; i++) {
            if (this.players[i].score < winner.score) {
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
    }
}

// יצירת אובייקט המשחק והפעלתו
document.addEventListener('DOMContentLoaded', () => {
    new NumberMemoryGame();
});
