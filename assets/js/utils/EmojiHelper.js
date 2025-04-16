/**
 * מחלקת עזר לטיפול באימוג'ים
 * מאפשרת להשתמש באימוג'ים מספריית OpenMoji במקום באימוג'ים של מערכת ההפעלה
 */
class EmojiHelper {
    constructor() {
        // מיפוי בין אימוג'ים לקודי יוניקוד שלהם
        this.emojiToUnicode = {
            // פירות
            '🍎': '1F34E', // תפוח
            '🍌': '1F34C', // בננה
            '🍇': '1F347', // ענבים
            '🍉': '1F349', // אבטיח
            '🍒': '1F352', // דובדבנים
            '🍓': '1F353', // תות
            '🍑': '1F351', // אפרסק
            '🍍': '1F34D', // אננס
            '🥝': '1F95D', // קיווי
            '🍐': '1F350', // אגס
            '🥭': '1F96D', // מנגו
            '🍊': '1F34A', // תפוז
            
            // ירקות
            '🥦': '1F966', // ברוקולי
            '🥕': '1F955', // גזר
            '🌽': '1F33D', // תירס
            '🥔': '1F954', // תפוח אדמה
            '🍆': '1F346', // חציל
            '🥒': '1F952', // מלפפון
            '🥬': '1F96C', // חסה
            '🧅': '1F9C5', // בצל
            '🧄': '1F9C4', // שום
            '🌶️': '1F336', // פלפל חריף
            '🥗': '1F957', // סלט
            '🍅': '1F345', // עגבנייה
            
            // פרצופים
            '😀': '1F600', // שמח
            '😢': '1F622', // עצוב
            '😡': '1F621', // כועס
            '😱': '1F631', // מפוחד
            '🥰': '1F970', // מאוהב
            '😴': '1F634', // ישן
            '🤔': '1F914', // חושב
            '😎': '1F60E', // מגניב
            '🤣': '1F923', // צוחק
            '😇': '1F607', // מלאך
            '🥺': '1F97A', // מתחנן
            '😜': '1F61C', // מוציא לשון
            
            // ביגוד
            '👕': '1F455', // חולצה
            '👖': '1F456', // מכנסיים
            '👔': '1F454', // עניבה
            '👗': '1F457', // שמלה
            '🧥': '1F9E5', // מעיל
            '🧣': '1F9E3', // צעיף
            '🧤': '1F9E4', // כפפות
            '🧦': '1F9E6', // גרביים
            '👒': '1F452', // כובע
            '👑': '1F451', // כתר
            '👟': '1F45F', // נעליים
            '👠': '1F460', // נעלי עקב
            
            // אוכל
            '🍕': '1F355', // פיצה
            '🍔': '1F354', // המבורגר
            '🌮': '1F32E', // טאקו
            '🍣': '1F363', // סושי
            '🍜': '1F35C', // ראמן
            '🍦': '1F366', // גלידה
            '🍩': '1F369', // דונאט
            '🍰': '1F370', // עוגה
            '🥪': '1F96A', // כריך
            '🍝': '1F35D', // ספגטי
            '🥨': '1F968', // בייגלה
            '🍞': '1F35E', // לחם
            
            // סמל שאלה לקלפים מכוסים
            '?': '2753'
        };
        
        // בסיס URL לתמונות אימוג'י
        this.baseUrl = 'https://openmoji.org/data/color/svg/';
        
        // האם להשתמש בתמונות במקום אימוג'ים
        this.useImages = true;
        
        // מטמון של תמונות אימוג'י שכבר נטענו
        this.imageCache = {};
        
        // טעינה מראש של תמונות אימוג'י נפוצות
        this.preloadCommonEmojis();
    }
    
    /**
     * טעינה מראש של אימוג'ים נפוצים
     */
    preloadCommonEmojis() {
        // טעינת כל האימוג'ים מראש
        for (const emoji in this.emojiToUnicode) {
            this.getEmojiImageUrl(emoji);
        }
    }
    
    /**
     * קבלת URL לתמונת אימוג'י
     * @param {string} emoji - האימוג'י
     * @returns {string} - URL לתמונת האימוג'י
     */
    getEmojiImageUrl(emoji) {
        if (this.imageCache[emoji]) {
            return this.imageCache[emoji];
        }
        
        const unicodeHex = this.emojiToUnicode[emoji];
        if (!unicodeHex) {
            console.warn(`לא נמצא קוד יוניקוד לאימוג'י: ${emoji}`);
            return null;
        }
        
        const imageUrl = `${this.baseUrl}${unicodeHex}.svg`;
        this.imageCache[emoji] = imageUrl;
        return imageUrl;
    }
    
    /**
     * יצירת אלמנט HTML לאימוג'י
     * @param {string} emoji - האימוג'י
     * @param {string} className - מחלקת CSS לאלמנט (אופציונלי)
     * @returns {HTMLElement} - אלמנט HTML המכיל את האימוג'י
     */
    createEmojiElement(emoji, className = '') {
        if (!this.useImages) {
            const span = document.createElement('span');
            span.textContent = emoji;
            if (className) span.className = className;
            return span;
        }
        
        const imageUrl = this.getEmojiImageUrl(emoji);
        if (!imageUrl) {
            const span = document.createElement('span');
            span.textContent = emoji;
            if (className) span.className = className;
            return span;
        }
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = emoji;
        img.setAttribute('data-emoji', emoji);
        if (className) img.className = className;
        img.style.width = '1.4em';
        img.style.height = '1.4em';
        img.style.verticalAlign = 'middle';
        img.style.margin = '0 0.1em';
        
        return img;
    }
    
    /**
     * החלפת כל האימוג'ים בטקסט לתמונות
     * @param {string} text - הטקסט עם אימוג'ים
     * @param {string} className - מחלקת CSS לאלמנטים (אופציונלי)
     * @returns {DocumentFragment} - פרגמנט HTML עם תמונות במקום אימוג'ים
     */
    replaceEmojisWithImages(text, className = '') {
        const fragment = document.createDocumentFragment();
        let currentText = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            // בדיקה אם התו הוא אימוג'י
            if (this.emojiToUnicode[char]) {
                // הוספת טקסט שנאסף עד כה
                if (currentText) {
                    fragment.appendChild(document.createTextNode(currentText));
                    currentText = '';
                }
                
                // הוספת אלמנט אימוג'י
                fragment.appendChild(this.createEmojiElement(char, className));
            } else {
                // אוסף תווים רגילים
                currentText += char;
            }
        }
        
        // הוספת טקסט שנותר
        if (currentText) {
            fragment.appendChild(document.createTextNode(currentText));
        }
        
        return fragment;
    }
    
    /**
     * החלפת אלמנט HTML עם אימוג'ים לתמונות
     * @param {HTMLElement} element - האלמנט להחלפה
     * @param {string} className - מחלקת CSS לאלמנטים (אופציונלי)
     */
    replaceElementContent(element, className = '') {
        const text = element.textContent;
        element.textContent = '';
        element.appendChild(this.replaceEmojisWithImages(text, className));
    }
}

// יצירת מופע גלובלי של מחלקת העזר
const emojiHelper = new EmojiHelper();
