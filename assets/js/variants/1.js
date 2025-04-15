/**
 * משחק זיכרון קלאסי - מצא זוגות של קלפים זהים וצבור נקודות
 * יורש מהמחלקה הבסיסית BaseMemoryGame
 */
class ClassicMemoryGame extends BaseMemoryGame {
    constructor() {
        super({
            boardSelector: '#memory-board',
            difficultySelector: '.difficulty-btn',
            statsSelector: '.game-stats',
            messageSelector: '#game-message'
        });
        
        // סמלים לקלפים עם ניקוד
        this.cardData = [
            { symbol: '🍎', points: 10 },
            { symbol: '🍌', points: 20 },
            { symbol: '🍇', points: 30 },
            { symbol: '🍉', points: 40 },
            { symbol: '🍒', points: 50 },
            { symbol: '🍓', points: 60 },
            { symbol: '🍑', points: 70 },
            { symbol: '🍍', points: 80 },
            { symbol: '🥝', points: 90 },
            { symbol: '🍐', points: 100 },
            { symbol: '🥭', points: 110 },
            { symbol: '🥥', points: 120 },
            { symbol: '🌮', points: 130 },
            { symbol: '🍕', points: 140 },
            { symbol: '🍔', points: 150 },
            { symbol: '🍦', points: 160 },
            { symbol: '🦁', points: 170 },
            { symbol: '🐯', points: 180 },
            { symbol: '🐶', points: 190 },
            { symbol: '🐱', points: 200 },
            { symbol: '🐼', points: 210 },
            { symbol: '🐨', points: 220 },
            { symbol: '🐵', points: 230 },
            { symbol: '🐸', points: 240 },
            { symbol: '🦊', points: 250 },
            { symbol: '🦄', points: 260 },
            { symbol: '🐝', points: 270 },
            { symbol: '🦋', points: 280 },
            { symbol: '🐢', points: 290 },
            { symbol: '🐙', points: 300 },
            { symbol: '🦀', points: 310 },
            { symbol: '🐬', points: 320 }
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
        
        // בחירת סמלים אקראיים לפי מספר הזוגות הנדרש
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
            
            // הוספת הסמל והניקוד לצד הקדמי של הקלף
            const frontSide = card.querySelector('.front');
            const cardData = cardValues[i];
            
            // יצירת מבנה הקלף עם סמל וניקוד
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
        
        if (cardData1.symbol === cardData2.symbol) {
            // התאמה נמצאה - הוספת ניקוד לשחקן הנוכחי
            const currentPlayer = this.players[this.currentPlayerIndex];
            currentPlayer.score += cardData1.points;
            this.updatePlayerScore(currentPlayer);
            
            // סימון הקלפים כמתאימים
            this.markAsMatched();
            
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
     * בדיקה האם המשחק הסתיים
     */
    checkGameCompletion() {
        const totalPairs = this.cards.length / 2;
        
        if (this.matchedPairs === totalPairs) {
            this.stopTimer();
            this.gameActive = false;
            this.showCompletionMessage();
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
    new ClassicMemoryGame();
});
