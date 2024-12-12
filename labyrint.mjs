import * as readlinePromises from "node:readline/promises";
const rl = readlinePromises.createInterface({
    input: process.stdin,
    output: process.stdout
});
//#endregion
import ANSI from "./ANSI.mjs";
import KeyBoardManager from "./keyboardManager.mjs";
//import "./prototypes.mjs";
import { level1, level2, level3 } from "./levels.mjs";
import DICTIONARY from "./dictionary.mjs";
import SPLASH_SCREEN from "./splashScreen.mjs";

async function splashScreen() {
    console.log(SPLASH_SCREEN);
    return new Promise((SPLASH_SCREEN) => setTimeout(SPLASH_SCREEN, 2000));

}
await splashScreen();
console.clear()

let askQuestion = await rl.question(ANSI.COLOR.BLUE + DICTIONARY.en.press);


const FPS = 250;
let updating = false;
let levels = [level1, level2, level3];
let rawLevel = levels.shift();


let tempLevel = rawLevel.split("\n");
let level = [];
for (let i = 0; i < tempLevel.length; i++) {
    let row = tempLevel[i];
    let outputRow = row.split("");
    level.push(outputRow);
}

let pallet = {
    "█": ANSI.COLOR.LIGHT_GRAY,
    "H": ANSI.COLOR.GREEN,
    "$": ANSI.COLOR.WHITE,
    "B": ANSI.COLOR.RED,

}

let isDirty = true;

let playerPos = {
    row: null,
    col: null,
}

const EMPTY = " ";
const DOOR = DICTIONARY.en.showDoor;
const HERO = DICTIONARY.en.showHero;
const LOOT = DICTIONARY.en.showLoot;
const THINGS = [LOOT, EMPTY];
const BAD_THINGS = [DICTIONARY.en.badGuy];
const NPCs = [];
const POSSIBLE_PICKUPS = [
    { name: DICTIONARY.en.pickup1, attribute: DICTIONARY.en.attackDmg, value: 5 },
    { name: DICTIONARY.en.pickup2, attribute: DICTIONARY.en.attackDmg, value: 3 },
    { name: DICTIONARY.en.pickup3, attribute: DICTIONARY.en.hpGain, value: Math.round(Math.random() * (4 - 2)) + 2 },
    { name: DICTIONARY.en.pickup4, attribute: DICTIONARY.en.attackDmg, value: Math.round(Math.random() * (3 - 1)) + 1 },
];
const HP_MAX = 10;
const MAX_ATTACK = 2;
const playerStats = { hp: HP_MAX, chash: 0, attack: 1.1 }

let eventText = [];

let gl = setInterval(gameLoop, FPS)

function update() {

    if (updating) { return }
    updating = true;

    if (playerPos.row == null) {
        isDirty = true;

        for (let row = 0; row < level.length; row++) {
            for (let col = 0; col < level[row].length; col++) {
                let value = level[row][col];
                if (value == DICTIONARY.en.showHero) {
                    playerPos.row = row;
                    playerPos.col = col;

                } else if (BAD_THINGS.includes(value)) {
                    let hp = Math.round(Math.random() * 6) + 4;
                    let attack = 0.7 + Math.random();
                    let badThing = { hp, attack, row, col };
                    NPCs.push(badThing);
                }
            }
        }
    }


    let drow = 0;
    let dcol = 0;


    if (KeyBoardManager.isUpPressed()) {
        drow = -1;
    } else if (KeyBoardManager.isDownPressed()) {
        drow = 1;
    }
    // Nå sjekker vi horisontalt 
    if (KeyBoardManager.isLeftPressed()) {
        dcol = -1;
    } else if (KeyBoardManager.isRightPressed()) {
        dcol = 1;
    }


    let tRow = playerPos.row + (1 * drow);
    let tCol = playerPos.col + (1 * dcol);

    if (THINGS.includes(level[tRow][tCol])) {

        let currentItem = level[tRow][tCol];
        if (currentItem == LOOT) {

            if (Math.random() < 0.95) {
                let loot = Math.round(Math.random() * (7 - 3)) + 3
                playerStats.chash += loot
                eventText = (`${DICTIONARY.en.gained} ${loot} ${DICTIONARY.en.showLoot}`);

            } else {
                let item = POSSIBLE_PICKUPS.random()
                playerStats.attack += item.value;
                eventText = (`${DICTIONARY.en.found} ${item.name} ${item.attribute} ${DICTIONARY.en.power} ${item.value}`);
            }
        }

        level[playerPos.row][playerPos.col] = EMPTY;
        level[tRow][tCol] = HERO;

        playerPos.row = tRow;
        playerPos.col = tCol;

        isDirty = true;

    } else if (BAD_THINGS.includes(level[tRow][tCol])) {
        let antagonist = null;
        for (let i = 0; i < NPCs.length; i++) {
            let b = NPCs[i];
            if (b.row = tRow && b.col == tCol) {
                antagonist = b;
            }
        }

        let attack = ((Math.random() * MAX_ATTACK) * playerStats.attack).toFixed(2);
        antagonist.hp -= attack;

        eventText = (`${DICTIONARY.en.dealtDamage} ${attack} ${DICTIONARY.en.pointsDamage}`);

        if (antagonist.hp <= 0) {
            eventText += DICTIONARY.en.badGuydead
            level[tRow][tCol] = EMPTY;

        } else {
            attack = ((Math.random() * MAX_ATTACK) * antagonist.attack).toFixed(2);
            playerStats.hp -= attack;
            eventText += (`\n${DICTIONARY.en.badGuyDamage} ${attack} ${DICTIONARY.en.inReturn}`);
        }

        tRow = playerPos.row;
        tCol = playerPos.col;
        isDirty = true;
    }
    else if (level[tRow][tCol] == DOOR) {
        rawLevel = levels.shift();
        playerPos.row = null;
        playerPos.col = null;
        eventText += (`${DICTIONARY.en.walkThrougDoor}`);

        newGameLevel();
    }
    updating = false;
}

function draw() {

    if (isDirty == false) {
        return;
    }

    isDirty = false;
    console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);

    let rendring = "";
    rendring += renderHUD();


    for (let row = 0; row < level.length; row++) {
        let rowRendering = "";
        for (let col = 0; col < level[row].length; col++) {
            let symbol = level[row][col];
            if (pallet[symbol] != undefined) {
                if (BAD_THINGS.includes(symbol)) {

                    rowRendering += pallet[symbol] + symbol + ANSI.COLOR_RESET;
                }
                else {
                    rowRendering += pallet[symbol] + symbol + ANSI.COLOR_RESET;
                }
            } else {
                if (symbol == DOOR) {
                    rowRendering += EMPTY;
                } else {
                    rowRendering += symbol;
                }

            }
        }
        rowRendering += "\n";
        rendring += rowRendering;
    }

    console.log(rendring);
    if (eventText != "") {
        console.log(eventText);
        eventText = "";
    }
}


function renderHUD() {
    let hpBar = `[${ANSI.COLOR.RED + pad(Math.round(playerStats.hp), "o") + ANSI.COLOR_RESET}${ANSI.COLOR.BLUE + pad(HP_MAX - playerStats.hp, "o") + ANSI.COLOR_RESET}]`
    let cash = `$:${playerStats.chash}`;
    return `${hpBar} ${cash} \n`;
}

function pad(len, text) {
    let output = "";
    for (let i = 0; i < len; i++) {
        output += text;
    }
    return output;
}

function eventtextTime() {

}

function gameLoop() {
    update();
    draw();
}
function newGameLevel() {
    tempLevel = rawLevel.split("\n");
    level = [];
    for (let i = 0; i < tempLevel.length; i++) {
        let row = tempLevel[i];
        let outputRow = row.split("");
        level.push(outputRow);

    }
};


