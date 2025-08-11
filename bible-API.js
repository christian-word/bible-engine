// bible-API.js
const BIBLE_JSON_URL = 'https://raw.githubusercontent.com/christian-word/bible-engine/refs/heads/main/bible_ua.json';

class BibleAPI {
    constructor() {
        this.data = null;
        this.readyCallbacks = [];
        this.load();
    }

    async load() {
        try {
            const res = await fetch(BIBLE_JSON_URL);
            this.data = await res.json();
            this.readyCallbacks.forEach(cb => cb());
        } catch (e) {
            console.error("Ошибка загрузки Bible JSON:", e);
        }
    }

    onReady(cb) {
        if (this.data) cb();
        else this.readyCallbacks.push(cb);
    }

    getBooks() {
        return this.data.map((book, index) => ({
            number: index + 1,
            name: book.name
        }));
    }

    getChapters(bookNumber) {
        return this.data[bookNumber - 1]?.chapters.length || 0;
    }

    getVerses(bookNumber, chapterNumber) {
        return this.data[bookNumber - 1]?.chapters[chapterNumber - 1] || [];
    }

    getVerse(bookNumber, chapterNumber, verseNumber) {
        return this.data[bookNumber - 1]?.chapters[chapterNumber - 1]?.[verseNumber - 1] || null;
    }

    search(query) {
        let results = [];
        const regex = query instanceof RegExp ? query : new RegExp(query, 'gi');

        this.data.forEach((book, bIndex) => {
            book.chapters.forEach((chapter, cIndex) => {
                chapter.forEach((verse, vIndex) => {
                    if (verse.match(regex)) {
                        results.push({
                            book: book.name,
                            chapter: cIndex + 1,
                            verse: vIndex + 1,
                            text: verse
                        });
                    }
                });
            });
        });
        return results;
    }

    getRandomVerse() {
        const bIndex = Math.floor(Math.random() * this.data.length);
        const cIndex = Math.floor(Math.random() * this.data[bIndex].chapters.length);
        const vIndex = Math.floor(Math.random() * this.data[bIndex].chapters[cIndex].length);

        return {
            book: this.data[bIndex].name,
            chapter: cIndex + 1,
            verse: vIndex + 1,
            text: this.data[bIndex].chapters[cIndex][vIndex]
        };
    }
}

const bible = new BibleAPI();
window.bible = bible;

