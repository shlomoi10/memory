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
                const newDifficulty = button.dataset.difficulty;
                this.changeDifficulty(newDifficulty);
            });
        });
        
        // כפתור התחלת משחק חדש
        const resetButton = document.querySelector('.reset-btn');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetGame();
            });
        }
        
        // כפתור חזרה לדף הבית
        const homeButton = document.querySelector('.home-btn');
        if (homeButton) {
            homeButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
        
        // כפתור אישור בפופאפ
        const confirmButton = document.getElementById('confirm-difficulty-change');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                this.confirmDifficultyChange();
            });
        }
        
        // כפתור ביטול בפופאפ
        const cancelButton = document.getElementById('cancel-difficulty-change');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.cancelDifficultyChange();
            });
        }
        
        // כפתורי הודעת סיום משחק
        const playAgainButton = document.querySelector('.play-again');
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => {
                this.resetGame();
                this.hideCompletionMessage();
            });
        }
        
        const goHomeButton = document.querySelector('.go-home');
        if (goHomeButton) {
            goHomeButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }
    
    /**
     * שינוי רמת קושי
     * @param {string} difficulty - רמת הקושי החדשה
     */
    changeDifficulty(difficulty) {
        if (this.gameActive) {
            // אם המשחק פעיל, שמירת רמת הקושי החדשה והצגת פופאפ אישור
            this.pendingDifficulty = difficulty;
            this.showConfirmationPopup();
        } else {
            // אם המשחק לא פעיל, שינוי מיידי של רמת הקושי
            this.difficulty = difficulty;
            this.updateDifficultyButtons();
            this.resetGame();
        }
    }
    
    /**
     * הצגת פופאפ אישור לשינוי רמת קושי
     */
    showConfirmationPopup() {
        const popup = document.getElementById('difficulty-confirmation');
        if (popup) {
            popup.classList.add('visible');
        }
    }
    
    /**
     * הסתרת פופאפ אישור
     */
    hideConfirmationPopup() {
        const popup = document.getElementById('difficulty-confirmation');
        if (popup) {
            popup.classList.remove('visible');
        }
    }
    
    /**
     * אישור שינוי רמת קושי
     */
    confirmDifficultyChange() {
        if (this.pendingDifficulty) {
            this.difficulty = this.pendingDifficulty;
            this.pendingDifficulty = null;
            this.updateDifficultyButtons();
            this.resetGame();
            this.hideConfirmationPopup();
        }
    }
    
    /**
     * ביטול שינוי רמת קושי
     */
    cancelDifficultyChange() {
        this.pendingDifficulty = null;
        this.hideConfirmationPopup();
    }
    
    /**
     * עדכון כפתורי רמת קושי
     */
    updateDifficultyButtons() {
        this.difficultyButtons.forEach(button => {
            if (button.dataset.difficulty === this.difficulty) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    /**
     * יצירת קלף
     * @param {number} index - אינדקס הקלף
     * @param {string} value - ערך הקלף (מקודד כ-JSON)
     * @returns {HTMLElement} - אלמנט הקלף
     */
    createCard(index, value) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.value = value;
        
        // יצירת צד קדמי ואחורי לקלף
        const front = document.createElement('div');
        front.className = 'front';
        
        const back = document.createElement('div');
        back.className = 'back';
        
        card.appendChild(front);
        card.appendChild(back);
        
        // הוספת מאזין אירועים ללחיצה על הקלף
        card.addEventListener('click', () => {
            this.flipCard(card);
        });
        
        return card;
    }
    
    /**
     * הפיכת קלף
     * @param {HTMLElement} card - הקלף להפיכה
     */
    flipCard(card) {
        // אם המשחק לא פעיל, הקלף כבר הפוך, או כבר הפכנו 2 קלפים - לא עושים כלום
        if (!this.gameActive || card.classList.contains('flipped') || this.flippedCards.length >= 2) {
            return;
        }
        
        // הפיכת הקלף
        card.classList.add('flipped');
        this.flippedCards.push(card);
        
        // אם זה הקלף השני שהפכנו, בדיקת התאמה
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            this.checkMatch();
        }
    }
    
    /**
     * סימון זוג קלפים כמתאימים
     */
    markAsMatched() {
        this.flippedCards.forEach(card => {
            card.classList.add('matched');
            card.classList.remove('flipped');
            
            // הסרת מאזין האירועים מהקלף
            card.style.pointerEvents = 'none';
        });
        
        this.matchedPairs++;
        this.flippedCards = [];
        
        // בדיקה האם המשחק הסתיים
        this.checkGameCompletion();
    }
    
    /**
     * איפוס קלפים שהופכו (אין התאמה)
     */
    resetFlippedCards() {
        setTimeout(() => {
            this.flippedCards.forEach(card => {
                card.classList.remove('flipped');
            });
            this.flippedCards = [];
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
        const messageTitle = this.messageElement.querySelector('.message-title');
        const messageText = this.messageElement.querySelector('.message-text');
        
        messageTitle.textContent = 'המשחק הסתיים!';
        messageText.textContent = `השלמת את המשחק ב-${this.moves} מהלכים ו-${this.formatTime(this.getElapsedTime())}`;
        
        this.messageElement.classList.add('visible');
    }
    
    /**
     * הסתרת הודעת סיום משחק
     */
    hideCompletionMessage() {
        this.messageElement.classList.remove('visible');
    }
    
    /**
     * התחלת טיימר
     */
    startTimer() {
        this.startTime = Date.now();
        
        this.timerInterval = setInterval(() => {
            const elapsedTime = this.getElapsedTime();
            this.updateTimer(elapsedTime);
        }, 1000);
    }
    
    /**
     * עצירת טיימר
     */
    stopTimer() {
        clearInterval(this.timerInterval);
    }
    
    /**
     * קבלת הזמן שעבר מתחילת המשחק
     * @returns {number} - הזמן שעבר בשניות
     */
    getElapsedTime() {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
    
    /**
     * עדכון תצוגת הטיימר
     * @param {number} seconds - זמן בשניות
     */
    updateTimer(seconds) {
        const timerElement = document.querySelector('.stat-value[data-stat="time"]');
        if (timerElement) {
            timerElement.textContent = this.formatTime(seconds);
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
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    /**
     * עדכון סטטיסטיקות משחק
     */
    updateStats() {
        // עדכון מספר מהלכים
        const movesElement = document.querySelector('.stat-value[data-stat="moves"]');
        if (movesElement) {
            movesElement.textContent = this.moves;
        }
        
        // עדכון מספר זוגות
        const pairsElement = document.querySelector('.stat-value[data-stat="pairs"]');
        if (pairsElement) {
            const totalPairs = this.cards.length / 2;
            pairsElement.textContent = `${this.matchedPairs}/${totalPairs}`;
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
     * איפוס המשחק
     */
    resetGame() {
        // ניקוי לוח המשחק
        this.boardElement.innerHTML = '';
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        
        // עצירת טיימר קודם אם קיים
        this.stopTimer();
        
        // אתחול לוח המשחק
        this.initializeBoard();
        
        // עדכון סטטיסטיקות
        this.updateStats();
        this.updateTimer(0);
        
        // הסתרת הודעת סיום
        this.hideCompletionMessage();
        
        // התחלת המשחק
        this.gameActive = true;
        this.startTimer();
    }
    
    /**
     * אתחול לוח המשחק
     * שיטה זו צריכה להיות מיושמת בכל מחלקה יורשת
     */
    initializeBoard() {
        // שיטה זו צריכה להיות מיושמת בכל מחלקה יורשת
        console.warn('initializeBoard() method should be implemented in derived class');
    }
    
    /**
     * בדיקת התאמה בין שני קלפים
     * שיטה זו צריכה להיות מיושמת בכל מחלקה יורשת
     */
    checkMatch() {
        // שיטה זו צריכה להיות מיושמת בכל מחלקה יורשת
        console.warn('checkMatch() method should be implemented in derived class');
    }
}
