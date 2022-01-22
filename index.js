import promptConstructor from 'prompt-sync';
import fs from 'fs';
import _ from 'lodash';

const prompt = promptConstructor({ sigint: true });

function askParams() {
    const lang = prompt('Language? [tl]:') || 'tl';
    console.log(`${lang} selected`);

    const wordLen = _.parseInt(prompt('How many letters? [5]')) || 5;
    console.log(`${wordLen} letters`);

    return { lang, wordLen };
}

function getWordlist(lang, wordLen) {
    try {
        const fromDict = fs.readFileSync(`dictionaries/${lang}.txt`, 'utf8');
        return _.filter(fromDict.split('\n'), w => w.length === wordLen);
    } catch (e) {
        console.error('Error:', e.stack);
        process.exit(1);
    }
}

function confirmSuggestion(suggestion) {
    console.log(`Suggested word:\t${suggestion}`);
    return true;
    // const useWord = _.toLower(prompt('Use this word? [Yn]: ')) || 'y';
    // return useWord === 'y';
}

function getFirstSuggestion(wordlist, wordLen) {
    const suggestions = _.filter(wordlist, w => _.uniq(w).length === wordLen);
    const suggestion = _.sample(suggestions);

    if (confirmSuggestion(suggestion)) {
        return suggestion;
    }

    return getFirstSuggestion(wordlist, wordLen);
}

function getSuggestion(wordlist, currentWord, misplaced, wrongLetters) {
    const suggestions = _.filter(wordlist, w => {
        const hasRightLetters = _.every(currentWord, (c, i) => c === '-' || w[i] === c);
        if (!hasRightLetters) return false;

        const containsMisplaced = _.every(misplaced, ms => _.every(ms, (m, i) => m === '-' || (w.includes(m) && w[i] !== m)));
        const hasNoWrongLetters = _.every(w, c => !wrongLetters.includes(c));

        return containsMisplaced
            && hasNoWrongLetters;
    });

    const suggestion = _.sample(suggestions);
    if (confirmSuggestion(suggestion)) {
        return suggestion;
    }

    return getSuggestion(wordlist, currentWord, misplaced, wrongLetters)
}

function askResult(wordLen) {
    const result = _.toLower(prompt('Result [xo-]: '));

    if (result.length !== wordLen || _.some(result, r => !'xo-'.includes(r))) {
        console.error('Invalid result, please try again');
        return askResult(wordLen);
    }

    return result;
}

function replaceCharAtIndex(word, char, index) {
    const wordArray = word.split('');
    wordArray[index] = char;
    return wordArray.join('');
}

function main() {
    const { lang, wordLen } = askParams();
    let wordlist = getWordlist(lang, wordLen);

    let wrongLetters = '';
    let misplaced = [''.padStart(wordLen, '-')];
    let currentWord = ''.padStart(wordLen, '-');

    let suggestion = '';
    let attemptCount = 0;

    while (currentWord.includes('-')) {
        attemptCount += 1;
        console.log(`\n#### Attempt ${attemptCount} ####`);

        suggestion = suggestion
            ? getSuggestion(wordlist, currentWord, misplaced, wrongLetters)
            : getFirstSuggestion(wordlist, wordLen);

        const result = askResult(wordLen);

        misplaced.push(''.padStart(wordLen, '-'));
        const mIndex = misplaced.length - 1;

        _.each(suggestion, (s, idx) => {
            switch (result[idx]) {
                case 'o':
                    currentWord = replaceCharAtIndex(currentWord, s, idx);
                    break;
                case '-':
                    misplaced[mIndex] = replaceCharAtIndex(misplaced[mIndex], s, idx);
                    break;
                case 'x':
                    if (currentWord.includes(s)) break;
                    wrongLetters += s;
            }
        });
    }

    console.log(`Wordle: ${currentWord}`);
}

main();
