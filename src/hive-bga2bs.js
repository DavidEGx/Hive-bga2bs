/**
 * Hive bga2bs
 *
 * Description:
 *
 * This script allows you to download a Hive game from BoardGameArena (BGA)
 * as a sgf file which can be reviewied in BoardSpace (BS).
 *
 * The reason behind this is BS game reviewer is far superior.
 *
 * Warnings:
 * I had to reverse engineer the way both BGA and BS work so this is likely
 * to fail. I'll try to fix what I can.
 *
 *
 * Usage:
 * 1. Go to any archived Hive game in BGA (example: https://en.boardgamearena.com/#!table?table=46229629)
 * 2. Replay game.
 * 3. Choose a player.
 * 4. Fire your javascript console and paste this script.
 *
 * As 4 is a pain in the ass the best way is to create a bookmark with the script.
 * See https://caiorss.github.io/bookmarklet-maker/
 */

/**
 * Class that represents a Hive bug.
 * Most important things about the bug are its name and position.
 */
class Bug {

  /**
   * Creates a new bug.
   * @param {string} bugName - Bug name. Examples: wS1, bQ, wA2, etc.
   * @param {HiveGame} hive  - The hive where this bug is in.
   */
  constructor(bugName, hive) {
    this._name         = bugName;
    this._bugType      = bugName.charAt(1);
    this._hive         = hive;
    this._pos          = undefined;
    this._lastMovement = undefined;
  }

  /**
   * @return {object} Bug position in the form { x: NUMBER, y: NUMBER }
   */
  get position() {
    return this._pos;
  }

  /**
   * Sets the position of this bug.
   * Receives a bug position string in bga format and transform
   * that into row and column.
   */
  setPositionFromBga(bgaPos) {
    bgaPos = bgaPos.replace("\\", "\\\\");
    this._lastMovement = bgaPos;

    if (bgaPos === '.') {
      this._pos = { x: 76, y: 10 }; // Equivalent to position "L 10" in BS
    }
    else {
      bgaPos = bgaPos.replace("wL", "wL1");
      bgaPos = bgaPos.replace("wP", "wP1");
      bgaPos = bgaPos.replace("wM", "wM1");
      bgaPos = bgaPos.replace("bL", "bL1");
      bgaPos = bgaPos.replace("bP", "bP1");
      bgaPos = bgaPos.replace("bM", "bM1");

      var matches;
      var otherBugPos;

      // TODO: This surely would require some explanation...
      if (matches = bgaPos.match("^/(.*)")) {
        otherBugPos   = this._hive.get(matches[1]).position;
        this._pos = { x: otherBugPos.x - 1, y: otherBugPos.y - 1 };
      }
      else if (matches = bgaPos.match(/^\\{2}(.*)/)) {
        otherBugPos   = this._hive.get(matches[1]).position;
        this._pos = { x: otherBugPos.x, y: otherBugPos.y + 1 };
      }
      else if (matches = bgaPos.match("^-(.*)")) {
        otherBugPos   = this._hive.get(matches[1]).position;
        this._pos = { x: otherBugPos.x - 1, y: otherBugPos.y };
      }
      else if (matches = bgaPos.match("(.*)?/$")) {
        otherBugPos   = this._hive.get(matches[1]).position;
        this._pos = { x: otherBugPos.x + 1, y: otherBugPos.y + 1 };
      }
      else if (matches = bgaPos.match(/(.*)\\{2}$/)) {
        otherBugPos   = this._hive.get(matches[1]).position;
        this._pos = { x: otherBugPos.x, y: otherBugPos.y - 1 };
      }
      else if (matches = bgaPos.match("(.*)-$")) {
        otherBugPos   = this._hive.get(matches[1]).position;
        this._pos = { x: otherBugPos.x + 1, y: otherBugPos.y };
      }
      else {
        otherBugPos   = this._hive.get(bgaPos).position;
        this._pos = { x: otherBugPos.x, y: otherBugPos.y };
      }
    }
  }

  /**
   * @return {string} Last movement of this bug in common hive notation
   */
  lastMovement() {
    return this._lastMovement;
  }

  /**
   * @return {string} 'pick' if the bug has not yet been places. Otherwise
   *                   will return 'pickb'.
   */
  bsPickCommand() {
    if (this.position === undefined) {
      return 'pick';
    }
    return 'pickb';
  }

  /**
   * @return {string} Position as it is used by BoardSpace.
   *                  (This is: "LETTER NUMBER". For example "L 10")
   */
  bsPosition() {
    if (this.position === undefined) {
      // Bugs in the reserve come from some magic position in boardspace.
      var bugIdx = {
        "Q": 0,
        "A": 1,
        "G": 2,
        "B": 3,
        "S": 4,
        "M": 5,
        "L": 6,
        "P": 7
      }
      return this._name.charAt(0).toUpperCase() + " " + bugIdx[this._bugType];

    }
    return String.fromCodePoint(this.position.x) + " " + this.position.y;
  }
}

/**
 * Class that represents a Hive Game.
 * Mainly a bunch of bugs and a list of movements.
 */
class HiveGame {

  /**
   * Creates a new Hive Game.
   * @param {number} tableId  - Table Id from BGA. Used for identification purposes.
   * @param {string} player_0 - Name of first player.
   * @param {string} player_1 - Name of second player.
   */
  constructor(tableId, player_0, player_1) {
    this._table_id  = tableId;
    this._player_0  = player_0;
    this._player_1  = player_1;
    this._bugs      = {};
    this._player    = 'P0';
    this._movements = [];
    this._moveIdx   = 1;
  }

  /**
   * Gets a bug that matches the bug name from the Hive.
   * It will create a new one if it does not exist yet.
   *
   * @param {string} The bug you are looking for (wA1, wQ, bP1, etc)
   * @return {Bug} The requested bug.
   */
  get(bugName) {
    this._bugs = this._bugs || { };

    if (!bugName.match(/\d/) && !bugName.match(/Q/)) {
      bugName += "1";
    }

    if (this._bugs[bugName]) {
      return this._bugs[bugName];
    }

    var bug = new Bug(bugName, this);
    this._bugs[bugName] = bug;
    return bug;
  }

  /**
   * Well, just changes the current player.
   * TODO: Probably this can be deleted or at least rewritten in a different
   * manner.
   */
  switchPlayer() {
    if (this._player === 'P0') {
      this._player = 'P1';
    }
    else {
      this._player = 'P0';
    }
  }

  /**
   * Adds a movement and translates it into a more BS friendly way.
   * @param {string} bgaMove - Move as it is stored in BGA js variables.
   */
  addMovement(bgaMove) {
    console.log(`Adding movement ${bgaMove}`);
    var bug    = this.get(bgaMove.split(" ")[0].trim());
    var bgaPos = bgaMove.split(" ")[1].trim() || ".";

    var bsPick = `${bug.bsPickCommand()} ${bug.bsPosition()}`;
    bug.setPositionFromBga(bgaPos);

    this._movements.push(`;${this._player}[${this._moveIdx++} ${bsPick} ${bug._name}]`);
    this._movements.push(`;${this._player}[${this._moveIdx++} dropb ${bug._name} ${bug.bsPosition()} ${bug.lastMovement()}]`);
    this._movements.push(`;${this._player}[${this._moveIdx++} done]`);

    this.switchPlayer();
  }

  /**
   * In BGA wA2 can appear before wA1, BS doesn't like that.
   * Need to swap bugs in case they appear in the wrong order.
   */
  _fixBugsOrder (gameStr) {
    var toFix = ['wA', 'wB', 'wG', 'wS', 'bA', 'bB', 'bG', 'bS'];


    // TODO: Rewrite in a less messy way
    for (var i = 0; i < toFix.length; i++) {
      var bug = toFix[i];
      var bug1   = bug + "1";
      var bug2   = bug + "2";
      var bug3   = bug + "3";
      var index1 = gameStr.indexOf(bug + "1");
      var index2 = gameStr.indexOf(bug + "2");
      var index3 = gameStr.indexOf(bug + "3");
      var re1 = new RegExp(bug1, 'g');
      var re2 = new RegExp(bug2, 'g');
      var re3 = new RegExp(bug3, 'g');

      if (index3 > 0) {
        if (index2 < 0) {
          gameStr = gameStr.replace(re3, bug2);
        }
        else if (index3 < index2) {
          gameStr = gameStr.replace(re3, 'SWAPME');
          gameStr = gameStr.replace(re2, bug3);
          gameStr = gameStr.replace(/SWAPME/g, bug2);
        }
      }

      if (index2 > 0) {
        if (index1 < 0) {
          gameStr = gameStr.replace(re2, bug1);
        }
        else if (index2 < index1) {
          gameStr = gameStr.replace(re2, 'SWAPME');
          gameStr = gameStr.replace(re1, bug2);
          gameStr = gameStr.replace(/SWAPME/g, bug1);
        }
      }

      if (index3 > 0) {
        if (index2 < 0) {
          gameStr = gameStr.replace(re3, bug2);
        }
        else if (index3 < index2) {
          gameStr = gameStr.replace(re3, 'SWAPME');
          gameStr = gameStr.replace(re2, bug3);
          gameStr = gameStr.replace(/SWAPME/g, bug2);
        }
      }
    }
    return gameStr;
  }

  /**
   * Returns the game string in a format understandable by BoardSpace.
   */
  getBsGame () {
    var gameStr = `(;
      GM[27]VV[1]
      SU[hive-plm]
      P0[id "${this._player_0}"]
      P1[id "${this._player_1}"]
      ; P0[0 Start P0]
    `;

    gameStr += this._movements.join("\n");
    gameStr += "\n)";

    return this._fixBugsOrder(gameStr);
  }

  /**
   * @return {string} Name for the game.
   */
  getBsName () {
    return `bga2bs-${this._player_0}-${this._player_1}-${this._table_id}.sgf`;
  }
}

var table_id = g_gamelogs[0].table_id;
var player_0 = g_gamelogs[1].data[0].args.player_name;
var player_1 = g_gamelogs[2].data[0].args.player_name;
var hiveGame = new HiveGame(table_id, player_0, player_1);

for (var i = 0; i < g_gamelogs.length; i++) {
  var actions = g_gamelogs[i].data;
  for (var j = 0; j < actions.length; j++) {
    var action = actions[j];
    if (action.type === "tokenPlayed") {
      var bgaMove = action.args.notation;
      if (bgaMove.match(/.* .*/)) {
        hiveGame.addMovement(bgaMove);
      }
      else {
        console.error("Player should use Tournament notation for this to work");
      }
    }
  }
}

downloadURI("data:text/plain," + encodeURIComponent(hiveGame.getBsGame()), hiveGame.getBsName());

function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  delete link;
}
