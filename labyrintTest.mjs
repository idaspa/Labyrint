//#region 
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




// Brettet som er lastet inn er i form av tekst, vi må omgjøre teksten til en 
// to dimensjonal liste [][] for å kunne tolke hva som er hvor etc.
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

    if (THINGS.includes(level[tRow][tCol])) { // Er det en gjenstand der spilleren prøver å gå?

        let currentItem = level[tRow][tCol];
        if (currentItem == LOOT) {

            if (Math.random() < 0.95) {
                let loot = Math.round(Math.random() * (7 - 3)) + 3
                playerStats.chash += loot
                eventText = (`${DICTIONARY.en.gained} ${loot} ${DICTIONARY.en.showLoot}`); // Vi bruker eventText til å fortelle spilleren hva som har intruffet.
            } else { // i 5% av tilfellen tildeler vi en tilfeldig gjenstand fra listen over gjenstander. 
                let item = POSSIBLE_PICKUPS.random()
                playerStats.attack += item.value;
                eventText = (`${DICTIONARY.en.found} ${item.name} ${item.attribute} ${DICTIONARY.en.power} ${item.value}`);// Vi bruker eventText til å fortelle spilleren hva som har intruffet.
            }
        }

        level[playerPos.row][playerPos.col] = EMPTY; // Der helten står nå settes til tom 
        level[tRow][tCol] = HERO; // Den nye plaseringen på kartet settes til å inneholde helten

        // Oppdaterer heltens posisjon
        playerPos.row = tRow;
        playerPos.col = tCol;

        // Sørger for at vi tegner den nye situasjonen. 
        isDirty = true;
    } else if (BAD_THINGS.includes(level[tRow][tCol])) { // Spilleren har forsøkt å gå inn der hvor det står en "motstander" av en eller annen type

        // Vi må finne den riktige "motstanderen" i listen over motstandere. 
        let antagonist = null;
        for (let i = 0; i < NPCs.length; i++) {
            let b = NPCs[i];
            if (b.row = tRow && b.col == tCol) {
                antagonist = b;
            }
        }

        // Vi beregner hvor mye skade spilleren påfører motstanderen
        let attack = ((Math.random() * MAX_ATTACK) * playerStats.attack).toFixed(2);
        antagonist.hp -= attack; // Påfører skaden. 

        eventText = (`${DICTIONARY.en.dealtDamage} ${attack} ${DICTIONARY.en.pointsDamage}`); // Forteller spilleren hvor mye skade som ble påfært

        if (antagonist.hp <= 0) { // Sjekker om motstanderen er død.
            eventText += DICTIONARY.en.badGuydead // Sier i fra at motstandren er død
            level[tRow][tCol] = EMPTY;
        } else {
            attack = ((Math.random() * MAX_ATTACK) * antagonist.attack).toFixed(2);
            playerStats.hp -= attack;
            eventText += (`\n${DICTIONARY.en.badGuyDamage} ${attack} ${DICTIONARY.en.inReturn}`);
            if (HERO.hp <= 0); {
                eventText += DICTIONARY.en.playerDead;

                // Setter temp pos tilbake siden dette har vært en kamp runde
                tRow = playerPos.row;
                tCol = playerPos.col;

                // Sørger for at vi tegner den nye situasjonen.
                isDirty = true;
            } if (level[tRow][tCol] == DOOR) {
                rawLevel = levels.shift();
                playerPos.row = null;
                playerPos.col = null;
                eventText += (`${DICTIONARY.en.walkThrougDoor}`);

                newGameLevel();
            }
            updating = false;
        }
    }

    function draw() {

        // Vi tegner kunn dersom spilleren har gjort noe.
        if (isDirty == false) {
            return;
        }
        isDirty = false;

        // Tømmer skjermen 
        console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);

        // Starter tegningen vår av den nåværende skjerm. 
        let rendring = "";

        // Bruker en funksjon for å tegne opp HUD elementer. 
        rendring += renderHUD();

        // Så går vi gjenom celle for celle og legger inn det som skal vises per celle. (husk rad+kolone = celle, tenk regneark)
        for (let row = 0; row < level.length; row++) {
            let rowRendering = "";
            for (let col = 0; col < level[row].length; col++) {
                let symbol = level[row][col];
                if (pallet[symbol] != undefined) {
                    if (BAD_THINGS.includes(symbol)) {
                        // Kan endre tegning dersom vi vill.
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
        if (eventText != "") { // dersom noe er lagt til i eventText så skriver vi det ut nå. Dette blir synelig til neste gang vi tegner (isDirty = true)
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
    }
};

