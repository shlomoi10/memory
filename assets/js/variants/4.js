/**
 * משחק זיכרון קטגוריות - מצא זוגות של קלפים זהים ואז נחש את הקטגוריה המתאימה
 * יורש מהמחלקה הבסיסית BaseMemoryGame
 */
class CategoryMemoryGame extends BaseMemoryGame {
    constructor() {
        super({
            boardSelector: '#memory-board',
            difficultySelector: '.difficulty-btn',
            statsSelector: '.game-stats',
            messageSelector: '#game-message'
        });
        
        // הגדרת קטגוריות עם אימוג'ים שייכים
        this.categories = [
            {
                name: 'פירות',
                symbol: '🍎',
                items: [
                    { symbol: '🍎', name: 'תפוח' },
                    { symbol: '🍌', name: 'בננה' },
                    { symbol: '🍇', name: 'ענבים' },
                    { symbol: '🍉', name: 'אבטיח' },
                    { symbol: '🍒', name: 'דובדבנים' },
                    { symbol: '🍓', name: 'תות' },
                    { symbol: '🍑', name: 'אפרסק' },
                    { symbol: '🍍', name: 'אננס' },
                    { symbol: '🥝', name: 'קיווי' },
                    { symbol: '🍐', name: 'אגס' },
                    { symbol: '🥭', name: 'מנגו' },
                    { symbol: '🍊', name: 'תפוז' }
                ]
            },
            {
                name: 'ירקות',
                symbol: '🥦',
                items: [
                    { symbol: '🥦', name: 'ברוקולי' },
                    { symbol: '🥕', name: 'גזר' },
                    { symbol: '🌽', name: 'תירס' },
                    { symbol: '🥔', name: 'תפוח אדמה' },
                    { symbol: '🍆', name: 'חציל' },
                    { symbol: '🥒', name: 'מלפפון' },
                    { symbol: '🥬', name: 'חסה' },
                    { symbol: '🧅', name: 'בצל' },
                    { symbol: '🧄', name: 'שום' },
                    { symbol: '🌶️', name: 'פלפל חריף' },
                    { symbol: '🥗', name: 'סלט' },
                    { symbol: '🍅', name: 'עגבנייה' }
                ]
            },
            {
                name: 'פרצופים',
                symbol: '😀',
                items: [
                    { symbol: '😀', name: 'שמח' },
                    { symbol: '😢', name: 'עצוב' },
                    { symbol: '😡', name: 'כועס' },
                    { symbol: '😱', name: 'מפוחד' },
                    { symbol: '🥰', name: 'מאוהב' },
                    { symbol: '😴', name: 'ישן' },
                    { symbol: '🤔', name: 'חושב' },
                    { symbol: '😎', name: 'מגניב' },
                    { symbol: '🤣', name: 'צוחק' },
                    { symbol: '😇', name: 'מלאך' },
                    { symbol: '🥺', name: 'מתחנן' },
                    { symbol: '😜', name: 'מוציא לשון' }
                ]
            },
            {
                name: 'ביגוד',
                symbol: '👕',
                items: [
                    { symbol: '👕', name: 'חולצה' },
                    { symbol: '👖', name: 'מכנסיים' },
                    { symbol: '👔', name: 'עניבה' },
                    { symbol: '👗', name: 'שמלה' },
                    { symbol: '🧥', name: 'מעיל' },
                    { symbol: '🧣', name: 'צעיף' },
                    { symbol: '🧤', name: 'כפפות' },
                    { symbol: '🧦', name: 'גרביים' },
                    { symbol: '👒', name: 'כובע' },
                    { symbol: '👑', name: 'כתר' },
                    { symbol: '👟', name: 'נעליים' },
                    { symbol: '👠', name: 'נעלי עקב' }
                ]
            },
            {
                name: 'אוכל',
                symbol: '🍕',
                items: [
                    { symbol: '🍕', name: 'פיצה' },
                    { symbol: '🍔', name: 'המבורגר' },
                    { symbol: '🌮', name: 'טאקו' },
                    { symbol: '🍣', name: 'סושי' },
                    { symbol: '🍜', name: 'ראמן' },
                    { symbol: '🍦', name: 'גלידה' },
                    { symbol: '🍩', name: 'דונאט' },
                    { symbol: '🍰', name: 'עוגה' },
                    { symbol: '🥪', name: 'כריך' },
                    { symbol: '🍝', name: 'ספגטי' },
                    { symbol: '🥨', name: 'בייגלה' },
                    { symbol: '🍞', name: 'לחם' }
                ]
            }
        ];
        
        // נתוני שחקנים
        this.players = [
            { name: 'שחקן 1', score: 0, element: document.querySelector('.player-1') },
            { name: 'שחקן 2', score: 0, element: document.querySelector('.player-2') }
        ];
        
        this.currentPlayerIndex = 0;
        this.turnChanged = false;
        
        // מידע על הזוג האחרון שנמצא
        this.lastMatchedCategory = null;
        this.lastMatchedSymbol = null;
        
        // פופאפ ניחוש הקטגוריה
        this.popupOverlay = document.getElementById('category-popup');
        this.popupBoard = document.getElementById('category-popup-board');
        
        // בדיקה שאלמנטי הפופאפ נמצאו
        console.log("אלמנט הפופאפ בבנאי:", this.popupOverlay);
        console.log("אלמנט לוח הפופאפ בבנאי:", this.popupBoard);
        
        // קלפים שנמצאו כזוג זמני (לא מסומנים כמתאימים עדיין)
        this.tempMatchedCards = [];
        
        // קטגוריות שנבחרו למשחק
        this.gameCategories = [];
        
        // אתחול המשחק
        this.resetGame();
        
        // הוספת מאזין אירועים לטעינת העמוד
        window.addEventListener('DOMContentLoaded', () => {
            console.log("העמוד נטען במלואו");
            // איתור מחדש של אלמנטי הפופאפ לאחר טעינת העמוד
            this.popupOverlay = document.getElementById('category-popup');
            this.popupBoard = document.getElementById('category-popup-board');
            console.log("אלמנט הפופאפ לאחר טעינה:", this.popupOverlay);
            console.log("אלמנט לוח הפופאפ לאחר טעינה:", this.popupBoard);
        });
    }
    
    /**
     * אתחול לוח המשחק
     */
    initializeBoard() {
        const size = this.boardSize[this.difficulty];
        const totalCards = size * size;
        
        // מספר הזוגות הוא מחצית ממספר הקלפים
        const pairsCount = totalCards / 2;
        this.totalPairs = pairsCount;
        
        // מספר הקטגוריות לפי רמת הקושי
        const categoriesCount = this.getCategoriesCountByDifficulty();
        
        // בחירת קטגוריות אקראיות לפי רמת הקושי
        const shuffledCategories = this.shuffleArray([...this.categories]);
        const selectedCategories = shuffledCategories.slice(0, categoriesCount);
        
        // שמירת הקטגוריות שנבחרו למשחק
        this.gameCategories = [...selectedCategories];
        
        console.log(`מאתחל לוח משחק: גודל ${size}x${size}, סה"כ ${totalCards} קלפים, ${pairsCount} זוגות, ${categoriesCount} קטגוריות`);
        
        // יצירת מערך של כל האימוג'ים מהקטגוריות שנבחרו
        let allItems = [];
        selectedCategories.forEach(category => {
            category.items.forEach(item => {
                // הוספת שדה קטגוריה לכל פריט
                allItems.push({
                    ...item,
                    category: category.name,
                    categorySymbol: category.symbol
                });
            });
        });
        
        // ערבוב כל האימוג'ים
        allItems = this.betterShuffle(allItems);
        
        // בחירת פריטים אקראיים לפי מספר הזוגות הנדרש
        const selectedItems = allItems.slice(0, pairsCount);
        
        // יצירת מערך של זוגות (כל פריט מופיע פעמיים)
        let cardValues = [];
        selectedItems.forEach(item => {
            // יצירת 2 קלפים זהים מכל פריט
            for (let i = 0; i < 2; i++) {
                cardValues.push({ ...item });
            }
        });
        
        // ערבוב הקלפים באמצעות אלגוריתם Fisher-Yates משופר
        cardValues = this.betterShuffle(cardValues);
        
        // ניקוי לוח המשחק
        this.boardElement.innerHTML = '';
        this.cards = [];
        
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
            
            // יצירת מבנה הקלף עם אימוג'י ושם
            frontSide.innerHTML = '';
            
            // הוספת אימוג'י באמצעות ספריית האימוג'ים
            const symbolContainer = document.createElement('div');
            symbolContainer.className = 'card-symbol';
            const emojiElement = emojiHelper.createEmojiElement(cardData.symbol, 'emoji-image');
            symbolContainer.appendChild(emojiElement);
            frontSide.appendChild(symbolContainer);
            
            // הוספת שם האימוג'י
            const nameElement = document.createElement('div');
            nameElement.className = 'card-item-name';
            nameElement.textContent = cardData.name;
            frontSide.appendChild(nameElement);
        }
        
        // הוספת סגנון CSS לשם האימוג'י
        if (!document.getElementById('emoji-styles')) {
            const style = document.createElement('style');
            style.id = 'emoji-styles';
            style.textContent = `
                .card-item-name {
                    font-size: 0.6rem;
                    margin-top: 0.2rem;
                    text-align: center;
                    font-weight: bold;
                    color: #333;
                }
                
                .emoji-image {
                    width: 2em !important;
                    height: 2em !important;
                }
                
                @media (max-width: 768px) {
                    .card-item-name {
                        font-size: 0.5rem;
                    }
                    
                    .emoji-image {
                        width: 1.5em !important;
                        height: 1.5em !important;
                    }
                }
            `;
            document.head.appendChild(style);
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
     * קבלת מספר הקטגוריות לפי רמת הקושי
     */
    getCategoriesCountByDifficulty() {
        switch (this.difficulty) {
            case 'easy':
                return 3;
            case 'medium':
                return 4;
            case 'hard':
                return 5;
            default:
                return 3;
        }
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
        
        // בדיקה שהערבוב אכן שינה את הסדר
        let changesCount = 0;
        for (let i = 0; i < array.length; i++) {
            if (array[i] !== newArray[i]) {
                changesCount++;
            }
        }
        
        // אם לא היו מספיק שינויים, ערבב שוב
        if (changesCount < array.length * 0.3 && array.length > 3) {
            console.log("ערבוב לא מספק, מערבב שוב...");
            return this.betterShuffle(array);
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
        
        if (cardData1.symbol === cardData2.symbol) {
            // שמירת הקטגוריה של הזוג שנמצא
            this.lastMatchedCategory = cardData1.category;
            this.lastMatchedSymbol = cardData1.symbol;
            
            console.log("נמצא זוג מתאים:", this.lastMatchedSymbol, "קטגוריה:", this.lastMatchedCategory);
            
            // שמירת הקלפים שנמצאו כזוג זמני (לא מסומנים כמתאימים עדיין)
            this.tempMatchedCards = [...this.flippedCards];
            this.flippedCards = [];
            
            // הצגת פופאפ לניחוש הקטגוריה אחרי השהייה קצרה
            setTimeout(() => {
                this.showCategoryPopup();
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
     * החלפת תור לשחקן הבא
     */
    switchPlayer() {
        if (this.turnChanged) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            this.updateCurrentPlayer();
            this.turnChanged = false;
        }
    }
    
    /**
     * עדכון השחקן הנוכחי
     */
    updateCurrentPlayer() {
        const currentPlayerElement = document.querySelector('.stat-value[data-stat="current-player"]');
        if (currentPlayerElement) {
            currentPlayerElement.textContent = this.players[this.currentPlayerIndex].name;
        }
        
        // עדכון סימון השחקן הפעיל
        this.players.forEach((player, index) => {
            if (index === this.currentPlayerIndex) {
                player.element.classList.add('active');
            } else {
                player.element.classList.remove('active');
            }
        });
    }
    
    /**
     * עדכון ניקוד השחקן
     * @param {Object} player - השחקן לעדכון
     */
    updatePlayerScore(player) {
        const scoreElement = player.element.querySelector('.player-score');
        if (scoreElement) {
            scoreElement.textContent = `${player.score} נקודות`;
        }
    }
    
    /**
     * הצגת פופאפ לניחוש הקטגוריה
     */
    showCategoryPopup() {
        console.log("פותח פופאפ קטגוריות");
        
        // בדיקה שאלמנטי הפופאפ קיימים
        if (!this.popupOverlay || !this.popupBoard) {
            console.error("אלמנטי הפופאפ חסרים!");
            this.popupOverlay = document.getElementById('category-popup');
            this.popupBoard = document.getElementById('category-popup-board');
            
            if (!this.popupOverlay || !this.popupBoard) {
                console.error("לא ניתן למצוא את אלמנטי הפופאפ!");
                return;
            }
        }
        
        // ניקוי לוח הפופאפ
        this.popupBoard.innerHTML = '';
        
        // עדכון כותרת הפופאפ עם האימוג'י שצריך למצוא
        const popupTitle = this.popupOverlay.querySelector('.popup-title');
        popupTitle.innerHTML = 'נחש את הקטגוריה של ';
        
        // הוספת האימוג'י לכותרת באמצעות ספריית האימוג'ים
        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'target-symbol';
        const emojiElement = emojiHelper.createEmojiElement(this.lastMatchedSymbol, 'emoji-image-title');
        emojiSpan.appendChild(emojiElement);
        popupTitle.appendChild(emojiSpan);
        
        // עדכון הטקסט המסביר
        const popupText = this.popupOverlay.querySelector('.popup-text');
        popupText.textContent = 'בחר את הקטגוריה המתאימה לזוג שמצאת';
        
        // הסרת תוצאה קודמת אם קיימת
        const popupContent = this.popupOverlay.querySelector('.popup-content');
        const existingResult = popupContent.querySelector('.popup-result');
        if (existingResult) popupContent.removeChild(existingResult);
        
        console.log("קטגוריות משחק:", this.gameCategories);
        
        // יצירת קלף פשוט לכל קטגוריה
        const categoriesDiv = document.createElement('div');
        categoriesDiv.className = 'category-cards';
        categoriesDiv.style.display = 'flex';
        categoriesDiv.style.flexWrap = 'wrap';
        categoriesDiv.style.justifyContent = 'center';
        categoriesDiv.style.gap = '10px';
        
        // משתנה לסימון האם כבר נלחץ קלף בפופאפ
        this.popupCardClicked = false;
        
        // ערבוב הקטגוריות לפני הצגתן
        const shuffledCategories = this.betterShuffle([...this.gameCategories]);
        
        // יצירת קלפים מכוסים לכל קטגוריה
        for (const category of shuffledCategories) {
            console.log("יוצר קלף לקטגוריה:", category.name);
            
            // יצירת קלף מכוסה
            const card = document.createElement('div');
            card.className = 'category-card';
            card.dataset.category = category.name;
            card.style.width = '100px';
            card.style.height = '100px';
            card.style.backgroundColor = '#3498db';
            card.style.borderRadius = '10px';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'center';
            card.style.alignItems = 'center';
            card.style.cursor = 'pointer';
            card.style.color = 'white';
            card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            card.style.transition = 'transform 0.3s, background-color 0.3s';
            
            // הצד המכוסה של הקלף
            const backSymbol = document.createElement('div');
            backSymbol.className = 'category-back-symbol';
            backSymbol.textContent = '?';
            backSymbol.style.fontSize = '2.5rem';
            backSymbol.style.fontWeight = 'bold';
            
            // הוספת הסמל המכוסה לקלף
            card.appendChild(backSymbol);
            
            // שמירת מידע על הקטגוריה בתוך הקלף (לא מוצג)
            const hiddenInfo = document.createElement('div');
            hiddenInfo.className = 'hidden-category-info';
            hiddenInfo.style.display = 'none';
            hiddenInfo.dataset.symbol = category.symbol;
            hiddenInfo.dataset.name = category.name;
            card.appendChild(hiddenInfo);
            
            // הוספת מאזין אירועים לניחוש
            card.addEventListener('click', () => {
                // בדיקה האם כבר נלחץ קלף בפופאפ
                if (this.popupCardClicked) return;
                
                // סימון שנלחץ קלף
                this.popupCardClicked = true;
                
                // חשיפת הקטגוריה בקלף
                backSymbol.style.display = 'none';
                
                // הוספת סמל הקטגוריה באמצעות ספריית האימוג'ים
                const symbolDiv = document.createElement('div');
                symbolDiv.className = 'category-symbol';
                const emojiElement = emojiHelper.createEmojiElement(category.symbol, 'emoji-image-category');
                symbolDiv.appendChild(emojiElement);
                
                const nameDiv = document.createElement('div');
                nameDiv.className = 'category-name';
                nameDiv.textContent = category.name;
                nameDiv.style.fontSize = '0.8rem';
                nameDiv.style.marginTop = '5px';
                nameDiv.style.fontWeight = 'bold';
                
                card.appendChild(symbolDiv);
                card.appendChild(nameDiv);
                
                // שינוי צבע הקלף שנבחר
                card.style.backgroundColor = '#2980b9';
                card.style.transform = 'scale(1.1)';
                
                // ניחוש הקטגוריה
                this.guessCategory(card);
            });
            
            categoriesDiv.appendChild(card);
        }
        
        // הוספת סגנון CSS לאימוג'ים בפופאפ
        if (!document.getElementById('emoji-popup-styles')) {
            const style = document.createElement('style');
            style.id = 'emoji-popup-styles';
            style.textContent = `
                .emoji-image-title {
                    width: 1.8em !important;
                    height: 1.8em !important;
                    vertical-align: middle;
                }
                
                .emoji-image-category {
                    width: 2.5em !important;
                    height: 2.5em !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        // הוספת הקלפים לפופאפ
        this.popupBoard.appendChild(categoriesDiv);
        
        // הצגת הפופאפ
        this.popupOverlay.classList.add('visible');
    }
    
    /**
     * ניחוש קטגוריה
     * @param {HTMLElement} card - הקלף שנבחר
     */
    guessCategory(card) {
        // בדיקה האם הניחוש נכון
        const selectedCategory = card.dataset.category;
        const correctCategory = this.getSymbolCategory(this.lastMatchedSymbol);
        const isCorrect = selectedCategory === correctCategory;
        
        console.log("ניחוש קטגוריה:", selectedCategory);
        console.log("קטגוריה נכונה:", correctCategory);
        console.log("האם הניחוש נכון:", isCorrect);
        
        // הוספת תוצאה לפופאפ
        const popupContent = this.popupOverlay.querySelector('.popup-content');
        const resultDiv = document.createElement('div');
        resultDiv.className = `popup-result ${isCorrect ? 'success' : 'failure'}`;
        
        if (isCorrect) {
            resultDiv.textContent = 'ניחוש נכון! קיבלת נקודה נוספת';
            // הוספת נקודה לשחקן הנוכחי
            this.addPoint(1);
        } else {
            resultDiv.textContent = `טעות! הקטגוריה הנכונה היא ${correctCategory}`;
            // סימון שיש להפוך את הקלפים בחזרה
            this.turnChanged = true;
        }
        
        popupContent.appendChild(resultDiv);
        
        // חשיפת כל הקלפים ומתן משוב ויזואלי
        setTimeout(() => {
            // חשיפת כל הקלפים
            const cards = this.popupBoard.querySelectorAll('.category-card');
            cards.forEach(c => {
                // הסרת סימן השאלה
                const backSymbol = c.querySelector('.category-back-symbol');
                if (backSymbol) backSymbol.style.display = 'none';
                
                // קבלת מידע הקטגוריה המוסתר
                const hiddenInfo = c.querySelector('.hidden-category-info');
                const categorySymbol = hiddenInfo.dataset.symbol;
                const categoryName = hiddenInfo.dataset.name;
                
                // הוספת תוכן הקטגוריה אם עדיין לא קיים
                if (!c.querySelector('.category-symbol')) {
                    // הוספת סמל הקטגוריה באמצעות ספריית האימוג'ים
                    const symbolDiv = document.createElement('div');
                    symbolDiv.className = 'category-symbol';
                    const emojiElement = emojiHelper.createEmojiElement(categorySymbol, 'emoji-image-category');
                    symbolDiv.appendChild(emojiElement);
                    
                    const nameDiv = document.createElement('div');
                    nameDiv.className = 'category-name';
                    nameDiv.textContent = categoryName;
                    nameDiv.style.fontSize = '0.8rem';
                    nameDiv.style.marginTop = '5px';
                    nameDiv.style.fontWeight = 'bold';
                    
                    c.appendChild(symbolDiv);
                    c.appendChild(nameDiv);
                }
                
                // הדגשת הקטגוריה הנכונה
                if (c.dataset.category === correctCategory) {
                    c.style.backgroundColor = '#2ecc71'; // ירוק
                    c.style.transform = 'scale(1.1)';
                    c.style.boxShadow = '0 0 15px rgba(46, 204, 113, 0.7)';
                } else if (c !== card) {
                    c.style.opacity = '0.6';
                }
            });
            
            // אם הניחוש שגוי, שינוי צבע הקלף שנבחר לאדום
            if (!isCorrect && card.dataset.category !== correctCategory) {
                card.style.backgroundColor = '#e74c3c'; // אדום
                card.style.boxShadow = '0 0 15px rgba(231, 76, 60, 0.7)';
            }
            
            // סגירת הפופאפ לאחר 2 שניות
            setTimeout(() => {
                this.closePopup();
                
                if (isCorrect) {
                    // סימון הקלפים כמתאימים רק אם הניחוש היה נכון
                    this.markCardsAsMatched();
                } else {
                    // אם הניחוש שגוי, הפיכת הקלפים בחזרה
                    this.resetTempMatchedCards();
                }
                
                // בדיקה האם המשחק הסתיים
                if (this.matchedPairs === this.totalPairs) {
                    this.endGame();
                } else {
                    // מעבר לשחקן הבא אם הניחוש היה שגוי
                    if (!isCorrect) {
                        this.switchPlayer();
                    }
                }
            }, 2000);
        }, 1000);
    }
    
    /**
     * סגירת הפופאפ
     */
    closePopup() {
        this.popupOverlay.classList.remove('visible');
        this.popupCardClicked = false;
    }
    
    /**
     * סימון קלפים כמתאימים
     */
    markCardsAsMatched() {
        this.tempMatchedCards.forEach(card => {
            card.classList.add('matched');
            card.style.pointerEvents = 'none';
        });
        this.matchedPairs++;
        this.tempMatchedCards = [];
    }
    
    /**
     * הפיכת קלפים זמניים בחזרה (במקרה של ניחוש שגוי)
     */
    resetTempMatchedCards() {
        console.log("מפעיל resetTempMatchedCards - הפיכת קלפים בחזרה");
        this.tempMatchedCards.forEach(card => {
            // הפיכת הקלף בחזרה
            card.classList.remove('flipped');
            card.style.pointerEvents = 'auto';
            
            // הסרת האנימציה של הקלף המתאים
            setTimeout(() => {
                card.classList.remove('temp-match');
            }, 300);
        });
        
        // איפוס מערך הקלפים הזמניים
        this.tempMatchedCards = [];
    }
    
    /**
     * קבלת הקטגוריה של סמל
     * @param {string} symbol - הסמל לבדיקה
     * @returns {string} - שם הקטגוריה
     */
    getSymbolCategory(symbol) {
        // לוג לבדיקת הסמל שמחפשים
        console.log("מחפש קטגוריה לסמל:", symbol);
        console.log("קטגוריות זמינות:", this.gameCategories);
        
        // בדיקה בכל קטגוריה
        for (const category of this.gameCategories) {
            // לוג לבדיקת הקטגוריה הנוכחית
            console.log("בודק קטגוריה:", category.name);
            console.log("פריטים בקטגוריה:", category.items);
            
            // בדיקה אם הסמל נמצא באחד הפריטים בקטגוריה
            for (const item of category.items) {
                if (item.symbol === symbol) {
                    console.log("מצאתי התאמה בקטגוריה:", category.name);
                    return category.name;
                }
            }
        }
        
        console.log("לא נמצאה קטגוריה מתאימה לסמל:", symbol);
        return null;
    }
    
    /**
     * הוספת נקודות לשחקן הנוכחי
     * @param {number} points - מספר הנקודות להוספה
     */
    addPoint(points) {
        const currentPlayer = this.players[this.currentPlayerIndex];
        currentPlayer.score += points;
        this.updatePlayerScore(currentPlayer);
    }
    
    /**
     * אתחול המשחק
     */
    resetGame() {
        super.resetGame();
        
        // איפוס משתנים
        this.lastMatchedCategory = null;
        this.lastMatchedSymbol = null;
        this.tempMatchedCards = [];
        
        // וידוא שהפופאפ מוסתר
        if (this.popupOverlay) {
            this.popupOverlay.classList.remove('visible');
        }
        
        // בדיקה שאלמנטי הפופאפ קיימים
        console.log("אלמנט הפופאפ:", this.popupOverlay);
        console.log("אלמנט לוח הפופאפ:", this.popupBoard);
        
        // אתחול לוח המשחק
        this.initializeBoard();
    }
}

// אתחול המשחק כאשר הדף נטען
document.addEventListener('DOMContentLoaded', () => {
    const game = new CategoryMemoryGame();
});
