class BibleAPI {
    constructor() {
        this.jsonUrl = this.determineJsonUrl();
        this.data = null;
        this.ready = this.load();
    }

    determineJsonUrl() {
        const src = document.currentScript?.src || '';
        if (src.includes('christian-word.github.io/bible-engine/')) {
            return src.replace(/[^\/]+$/, '') + 'bible_ua.json';
        }
        return './bible_ua.json';
    }

    async load() {
        const res = await fetch(this.jsonUrl);
        if (!res.ok) throw new Error(`Failed to load JSON (${res.status})`);
        this.data = await res.json();
    }

    async getBooks() {
        await this.ready;
        return this.data.map(b => ({ number: b.number, name: b.name, shortName: b.shortName }));
    }

    async getChapters(bookNumber) {
        await this.ready;
        const book = this.data.find(b => b.number === String(bookNumber));
        return book ? book.chapters.map(ch => ch.number) : [];
    }

    async getVerses(bookNumber, chapterNumber) {
        await this.ready;
        const book = this.data.find(b => b.number === String(bookNumber));
        const ch = book?.chapters.find(c => c.number === String(chapterNumber));
        return ch ? ch.verses : [];
    }

    async getVerse(bookNumber, chapterNumber, verseNumber) {
        const verses = await this.getVerses(bookNumber, chapterNumber);
        return verses.find(v => v.number === String(verseNumber)) || null;
    }

    async getVersesRange(bookNumber, chapterNumber, rangeStr) {
        const verses = await this.getVerses(bookNumber, chapterNumber);
        const parts = rangeStr.split(',').map(s => s.trim());
        const res = [];
        for (const p of parts) {
            if (p.includes('-')) {
                const [start, end] = p.split('-').map(Number);
                for (let i = start; i <= end; i++) {
                    const v = verses.find(x => Number(x.number) === i);
                    if (v) res.push(v);
                }
            } else {
                const num = Number(p);
                const v = verses.find(x => Number(x.number) === num);
                if (v) res.push(v);
            }
        }
        return res;
    }

    async search(query) {
        await this.ready;
        const q = query.toLowerCase();
        const results = [];
        for (const b of this.data) {
            for (const ch of b.chapters) {
                for (const v of ch.verses) {
                    if (v.text.toLowerCase().includes(q)) {
                        results.push({ book: b.name, chapter: ch.number, verse: v.number, text: v.text });
                    }
                }
            }
        }
        return results;
    }

    async searchRegex(pattern) {
        await this.ready;
        let regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'giu');
        const results = [];
        for (const b of this.data) {
            for (const ch of b.chapters) {
                for (const v of ch.verses) {
                    if (regex.test(v.text)) {
                        results.push({ book: b.name, chapter: ch.number, verse: v.number, text: v.text });
                    }
                }
            }
        }
        return results;
    }

    async getRandomVerse() {
        await this.ready;
        const bk = this.data[Math.floor(Math.random() * this.data.length)];
        const ch = bk.chapters[Math.floor(Math.random() * bk.chapters.length)];
        const v = ch.verses[Math.floor(Math.random() * ch.verses.length)];
        return { book: bk.name, chapter: ch.number, verse: v.number, text: v.text };
    }

    async getChapterText(bookNumber, chapterNumber) {
        const verses = await this.getVerses(bookNumber, chapterNumber);
        return verses.map(v => `${v.number}. ${v.text}`).join(' ');
    }
}

window.BibleAPI = new BibleAPI();
