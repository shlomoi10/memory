/**
 * מחלקת בסיס למשחקי זיכרון
 * מספקת את הפונקציונליות הבסיסית המשותפת לכל המשחקים
 */
class BaseMemoryGame {
    /**
     * @param {Object} config - הגדרות המשחק
     * @param {string} config.boardSelector - בורר CSS ללוח המשחק
     * @param {string} config.difficultySelector - בורר CSS לכפתורי רמת קושי
     * @param {string} config.statsSelector - בורר CSS לאזור הסטטיסטיקות
     * @param {string} config.messageSelector - בורר CSS להודעות המשחק
     */
    constructor(config) {
        this.config = config;
        this.boardElement = document.querySelector(config.boardSelector);
        this.difficultyButtons = document.querySelectorAll(config.difficultySelector);
        this.statsElement = document.querySelector(config.statsSelector);
        this.messageElement = document.querySelector(config.messageSelector);
        
        this.difficulty = 'easy'; // קל, בינוני, מתקדם
        this.boardSize = { easy: 4, medium: 6, hard: 8 }; // גדלי לוח לפי רמת קושי
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.gameActive = false;
        this.pendingDifficulty = null;
        
        this.initEventListeners();
    }
    
    /**
     * אתחול מאזיני אירועים
     */
    initEventListeners() {
        // מאזיני אירועים לכפתורי רמת קושי
        this.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const difficulty = button.dataset.difficulty;
                
                // אם המשחק כבר התחיל, הצג פופאפ אישור
                if (this.gameActive && this.moves > 0) {
                    this.showDifficultyConfirmation(difficulty);
                } else {
                    // אחרת, שנה את רמת הקושי ישירות
                    this.setDifficulty(difficulty);
                }
            });
        });
        
        // מאזין אירועים לכפתור התחל מחדש
        const restartButton = document.querySelector('.action-btn.restart');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.resetGame());
        }
        
        // מאזין אירועים לכפתורים בהודעת סיום משחק
        const messageButtons = this.messageElement.querySelectorAll('.message-btn');
        messageButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('play-again')) {
                    this.hideMessage();
                    this.resetGame();
                } else if (button.classList.contains('go-home')) {
                    window.location.href = 'index.html';
                }
            });
        });
        
        // מאזיני אירועים לפופאפ אישור שינוי רמת קושי
        const confirmationPopup = document.getElementById('difficulty-confirmation');
        const confirmButton = document.getElementById('confirm-difficulty-change');
        const cancelButton = document.getElementById('cancel-difficulty-change');
        
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                this.hideDifficultyConfirmation();
                this.setDifficulty(this.pendingDifficulty);
                this.pendingDifficulty = null;
            });
        }
        
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.hideDifficultyConfirmation();
                this.pendingDifficulty = null;
            });
        }
    }
    
    /**
     * הגדרת רמת קושי
     * @param {string} difficulty - רמת הקושי (easy, medium, hard)
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        
        // עדכון כפתורי רמת קושי
        this.difficultyButtons.forEach(button => {
            if (button.dataset.difficulty === difficulty) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        this.resetGame();
    }
    
    /**
     * אתחול המשחק מחדש
     */
    resetGame() {
        this.clearBoard();
        this.stopTimer();
        
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.gameActive = true;
        
        // הגדרת גודל הלוח לפי רמת הקושי
        const size = this.boardSize[this.difficulty];
        this.boardElement.setAttribute('data-size', size);
        
        this.initializeBoard();
        this.updateStats();
    }
    
    /**
     * ניקוי לוח המשחק
     */
    clearBoard() {
        while (this.boardElement.firstChild) {
            this.boardElement.removeChild(this.boardElement.firstChild);
        }
    }
    
    /**
     * אתחול לוח המשחק - יש לממש בכל מחלקה יורשת
     */
    initializeBoard() {
        throw new Error('יש לממש את מתודת initializeBoard במחלקה היורשת');
    }
    
    /**
     * יצירת קלף
     * @param {number} index - אינדקס הקלף
     * @param {*} value - ערך הקלף
     * @returns {HTMLElement} - אלמנט הקלף
     */
    createCard(index, value) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.value = value;
        
        const front = document.createElement('div');
        front.className = 'front';
        
        const back = document.createElement('div');
        back.className = 'back';
        
        card.appendChild(front);
        card.appendChild(back);
        
        card.addEventListener('click', () => this.flipCard(card));
        
        return card;
    }
    
    /**
     * הפיכת קלף
     * @param {HTMLElement} card - אלמנט הקלף
     */
    flipCard(card) {
        // אם המשחק לא פעיל, או שהקלף כבר הפוך או כבר התאמה
        if (!this.gameActive || this.flippedCards.includes(card) || card.classList.contains('matched')) {
            return;
        }
        
        // התחלת טיימר בלחיצה הראשונה
        if (!this.startTime) {
            this.startTimer();
        }
        
        // הפיכת הקלף
        card.classList.add('flipped');
        this.flippedCards.push(card);
        
        // בדיקת התאמה אחרי הפיכת שני קלפים
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            this.checkMatch();
        }
    }
    
    /**
     * בדיקת התאמה בין שני קלפים - יש לממש בכל מחלקה יורשת
     */
    checkMatch() {
        throw new Error('יש לממש את מתודת checkMatch במחלקה היורשת');
    }
    
    /**
     * סימון זוג קלפים כמתאימים
     */
    markAsMatched() {
        this.flippedCards.forEach(card => {
            card.classList.add('matched');
        });
        
        this.matchedPairs++;
        this.flippedCards = [];
        
        this.updateStats();
        this.checkGameCompletion();
    }
    
    /**
     * החזרת קלפים לא תואמים
     */
    resetFlippedCards() {
        this.gameActive = false;
        
        setTimeout(() => {
            this.flippedCards.forEach(card => {
                card.classList.remove('flipped');
            });
            
            this.flippedCards = [];
            this.gameActive = true;
        }, 1000);
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
        const time = this.formatTime(Math.floor((Date.now() - this.startTime) / 1000));
        
        const messageTitle = this.messageElement.querySelector('.message-title');
        const messageText = this.messageElement.querySelector('.message-text');
        
        messageTitle.textContent = 'כל הכבוד!';
        messageText.textContent = `סיימת את המשחק ב-${this.moves} מהלכים ובזמן של ${time}`;
        
        this.messageElement.classList.add('visible');
    }
    
    /**
     * הסתרת הודעת משחק
     */
    hideMessage() {
        this.messageElement.classList.remove('visible');
    }
    
    /**
     * התחלת טיימר
     */
    startTimer() {
        this.startTime = Date.now();
        
        this.timerInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
            const timeDisplay = document.querySelector('.stat-value[data-stat="time"]');
            if (timeDisplay) {
                timeDisplay.textContent = this.formatTime(elapsedSeconds);
            }
        }, 1000);
    }
    
    /**
     * עצירת טיימר
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    /**
     * פורמט זמן לתצוגה
     * @param {number} seconds - זמן בשניות
     * @returns {string} - זמן מפורמט
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * עדכון סטטיסטיקות המשחק
     */
    updateStats() {
        const movesDisplay = document.querySelector('.stat-value[data-stat="moves"]');
        const pairsDisplay = document.querySelector('.stat-value[data-stat="pairs"]');
        
        if (movesDisplay) {
            movesDisplay.textContent = this.moves;
        }
        
        if (pairsDisplay) {
            pairsDisplay.textContent = `${this.matchedPairs}/${this.cards.length / 2}`;
        }
    }
    
    /**
     * ערבוב מערך
     * @param {Array} array - המערך לערבוב
     * @returns {Array} - המערך המעורבב
     */
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    /**
     * הצגת פופאפ אישור שינוי רמת קושי
     * @param {string} difficulty - רמת הקושי החדשה
     */
    showDifficultyConfirmation(difficulty) {
        this.pendingDifficulty = difficulty;
        const confirmationPopup = document.getElementById('difficulty-confirmation');
        if (confirmationPopup) {
            confirmationPopup.classList.add('visible');
        }
    }
    
    /**
     * הסתרת פופאפ אישור שינוי רמת קושי
     */
    hideDifficultyConfirmation() {
        const confirmationPopup = document.getElementById('difficulty-confirmation');
        if (confirmationPopup) {
            confirmationPopup.classList.remove('visible');
        }
    }
}

window.BaseMemoryGame = BaseMemoryGame;
