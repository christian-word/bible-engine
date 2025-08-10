class BibleAPI {
    constructor(jsonUrl = 'https://raw.githubusercontent.com/christian-word/bible-engine/main/bible_ua.json') {
        this.jsonUrl = jsonUrl;
        this.data = [];
    }

    async load() {
        const response = await fetch(this.jsonUrl);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки JSON: ${response.status} ${response.statusText}`);
        }
        this.data = await response.json();
        console.log("Библия успешно загружена");
    }

    getBooks() {
        return this.data.map(book => ({
            number: book.number,
            shortName: book.shortName,
            name: book.name
        }));
    }

    getChapters(bookNumber) {
        const book = this.data.find(b => b.number === String(bookNumber));
        return book ? book.chapters.map(ch => ch.number) : [];
    }

    getVerses(bookNumber, chapterNumber) {
        const book = this.data.find(b => b.number === String(bookNumber));
        if (!book) return [];
        const chapter = book.chapters.find(ch => ch.number === String(chapterNumber));
        return chapter ? chapter.verses : [];
    }

    getVerse(bookNumber, chapterNumber, verseNumber) {
        const verses = this.getVerses(bookNumber, chapterNumber);
        return verses.find(v => v.number === String(verseNumber)) || null;
    }

    getVerseRange(bookNumber, chapterNumber, startVerse, endVerse) {
        const verses = this.getVerses(bookNumber, chapterNumber);
        return verses.filter(v => {
            const num = parseInt(v.number);
            return num >= startVerse && num <= endVerse;
        });
    }

    search(query) {
        const regex = new RegExp(query, "i");
        let results = [];
        this.data.forEach(book => {
            book.chapters.forEach(chapter => {
                chapter.verses.forEach(verse => {
                    if (regex.test(verse.text)) {
                        results.push({
                            book: book.name,
                            chapter: chapter.number,
                            verse: verse.number,
                            text: verse.text
                        });
                    }
                });
            });
        });
        return results;
    }
}

// Пример автозагрузки, чтобы в HTML всё было готово
const bible = new BibleAPI();
bible.load().then(() => {
    console.log("Книги:", bible.getBooks());
});


