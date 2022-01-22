# wardel
Assistant Solver for Wordle and clones

## Quick Start
Install dependencies first with `npm ci`, you only need to do this once

Then start with `npm start`


## Usage
1. Choose language (only en and tl supported currently)
2. Pick word size (must be 5 for en as the en dictionary only has 5 letter words)
3. Use the given suggestion
4. Feed results using corresponding character representation for the colors below:  

    >   | From | To |
    >   |:---:|:---:|
    >   |⬛|`x`|
    >   |🟧|`-`|
    >   |🟩|`o`|  
    >   
    >   e.g. 🟩⬛⬛🟩🟧 becomes `oxxo-`

5. Repeat 3-4 until it (hopefully) arrives to the right answer
