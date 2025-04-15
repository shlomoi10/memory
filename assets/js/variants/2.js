/**
 * משחק זיכרון מספרים - מצא זוגות של קלפים זהים, אי-התאמה מוסיפה נקודות עונשין
 * יורש מהמחלקה הבסיסית BaseMemoryGame
 */
class NumberMemoryGame extends BaseMemoryGame {
    constructor() {
        super({
            boardSelector: '#memory-board',
            difficultySelector: '.difficulty-btn',
            statsSelector: '.game-stats',
            messageSelector: '#game-message'
        });
        
        // נתוני קלפים עם מספרים ואימוג'י
        this.cardData = [
            { number: 1, emoji: '😀', points: 1 },
            { number: 2, emoji: '😎', points: 2 },
            { number: 3, emoji: '🥳', points: 3 },
            { number: 4, emoji: '😍', points: 4 },
            { number: 5, emoji: '🤩', points: 5 },
            { number: 6, emoji: '😇', points: 6 },
            { number: 7, emoji: '🤔', points: 7 },
            { number: 8, emoji: '🙄', points: 8 },
            { number: 9, emoji: '😮', points: 9 },
            { number: 10, emoji: '😱', points: 10 },
            { number: 11, emoji: '😴', points: 11 },
            { number: 12, emoji: '🥶', points: 12 },
            { number: 13, emoji: '🥵', points: 13 },
            { number: 14, emoji: '🤢', points: 14 },
            { number: 15, emoji: '🤮', points: 15 },
            { number: 16, emoji: '🤧', points: 16 },
            { number: 17, emoji: '😷', points: 17 },
            { number: 18, emoji: '🤒', points: 18 },
            { number: 19, emoji: '🤕', points: 19 },
            { number: 20, emoji: '🤑', points: 20 },
            { number: 21, emoji: '🤠', points: 21 },
            { number: 22, emoji: '👻', points: 22 },
            { number: 23, emoji: '👽', points: 23 },
            { number: 24, emoji: '👾', points: 24 },
            { number: 25, emoji: '🤖', points: 25 },
            { number: 26, emoji: '😡', points: 26 },
            { number: 27, emoji: '👶', points: 27 },
            { number: 28, emoji: '🧒', points: 28 },
            { number: 29, emoji: '👦', points: 29 },
            { number: 30, emoji: '👧', points: 30 },
            { number: 31, emoji: '🧑', points: 31 },
            { number: 32, emoji: '👨', points: 32 }
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
        
        // ערבוב מערך הקלפים המקורי לפני בחירת הקלפים
        const shuffledCardData = this.shuffleArray([...this.cardData]);
        
        // בחירת נתוני קלפים אקראיים לפי מספר הזוגות הנדרש
        // נוודא שלוקחים רק את ה-pairsCount הראשונים כדי שלא יהיו כפילויות
        const selectedCardData = shuffledCardData.slice(0, pairsCount);
        
        // יצירת מערך של זוגות
        let cardValues = [];
        selectedCardData.forEach(card => {
            cardValues.push({ ...card });
            cardValues.push({ ...card });
        });
        
        // ערבוב הקלפים באמצעות אלגוריתם Fisher-Yates משופר
        cardValues = this.betterShuffle(cardValues);
        
        // הגדרת גריד לפי גודל הלוח
        this.boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        
        // יצירת הקלפים
        for (let i = 0; i < totalCards; i++) {
            const card = this.createCard(i, JSON.stringify(cardValues[i]));
            this.boardElement.appendChild(card);
            this.cards.push(card);
            
            // הוספת האימוג'י והניקוד לצד הקדמי של הקלף
            const frontSide = card.querySelector('.front');
            const cardData = cardValues[i];
            
            // יצירת מבנה הקלף עם אימוג'י וניקוד
            frontSide.innerHTML = `
                <div class="card-symbol">${cardData.emoji}</div>
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
            // התאמה נמצאה - אין תוספת ניקוד
            
            // סימון הקלפים כמתאימים
            this.flippedCards.forEach(card => {
                card.classList.add('matched');
                card.style.pointerEvents = 'none';
            });
            this.matchedPairs++;
            this.flippedCards = [];
            
            // עדכון סטטיסטיקות
            this.updateStats();
            
            // בדיקה האם המשחק הסתיים
            this.checkGameCompletion();
            
            // השחקן הנוכחי ממשיך לשחק (לא מחליפים תור)
            this.turnChanged = false;
        } else {
            // אין התאמה - הוספת ניקוד עונשין לשחקן הנוכחי
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
            scoreElement.textContent = `${player.score} נקודות עונשין`;
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
            messageText.textContent = `תיקו! כל השחקנים צברו ${winner.score} נקודות עונשין`;
        } else {
            messageText.textContent = `המנצח: ${winner.name} עם ${winner.score} נקודות עונשין`;
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
    
    /**
     * ערבוב מערך באמצעות אלגוריתם Fisher-Yates משופר
     */
    betterShuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// יצירת אובייקט המשחק והפעלתו
document.addEventListener('DOMContentLoaded', () => {
    new NumberMemoryGame();
});
