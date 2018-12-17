# Hive-bga2bs
Download a Hive archived BGA game in sgf format.

You can:
* Download a single game from game page review (sgf file).
* Download a game in progress (sgf file).
* Download last 5 games from a player's game history (zip file).

## Demo
![GIF Demo](https://raw.githubusercontent.com/DavidEGx/Hive-bga2bs/master/hive-bga2bs.gif)

## Setup
Create a new bookmark in your browser that points to this "address":

    javascript:(function()%7B%2F*%20jshint%20esversion%3A%206%20*%2F%0A%2F**%0A%20*%20Hive%20bga2bs%0A%20*%0A%20*%20Description%3A%0A%20*%0A%20*%20This%20script%20allows%20you%20to%20download%20a%20Hive%20game%20from%20BoardGameArena%20(BGA)%0A%20*%20as%20a%20sgf%20file%20which%20can%20be%20reviewied%20in%20BoardSpace%20(BS).%0A%20*%0A%20*%20The%20reason%20behind%20this%20is%20BS%20game%20reviewer%20is%20far%20superior.%0A%20*%0A%20*%20Warnings%3A%0A%20*%20I%20had%20to%20reverse%20engineer%20the%20way%20both%20BGA%20and%20BS%20work%20so%20this%20is%20likely%0A%20*%20to%20fail.%20I'll%20try%20to%20fix%20what%20I%20can.%0A%20*%0A%20*%0A%20*%20Usage%3A%0A%20*%201.%20Go%20to%20any%20archived%20Hive%20game%20in%20BGA%20(example%3A%20https%3A%2F%2Fen.boardgamearena.com%2F%23!table%3Ftable%3D46229629)%0A%20*%202.%20Replay%20game.%0A%20*%203.%20Choose%20a%20player.%0A%20*%204.%20Fire%20your%20javascript%20console%20and%20paste%20this%20script.%0A%20*%0A%20*%20As%204%20is%20a%20pain%20in%20the%20ass%20the%20best%20way%20is%20to%20create%20a%20bookmark%20with%20the%20script.%0A%20*%20See%20https%3A%2F%2Fcaiorss.github.io%2Fbookmarklet-maker%2F%0A%20*%2F%0A%0A%2F%2F%20Don't%20want%20to%20flood%20BGA%20with%20too%20may%20requests.%0Aconst%20REQUEST_INTERVAL%20%3D%205000%3B%0Aconst%20MAX_GAMES%20%20%20%20%20%20%20%20%3D%205%3B%0A%0A%2F**%0A%20*%20Class%20that%20represents%20a%20Hive%20bug.%0A%20*%20Most%20important%20things%20about%20the%20bug%20are%20its%20name%20and%20position.%0A%20*%2F%0Aclass%20Bug%20%7B%0A%0A%20%20%2F**%0A%20%20%20*%20Creates%20a%20new%20bug.%0A%20%20%20*%20%40param%20%7Bstring%7D%20bugName%20-%20Bug%20name.%20Examples%3A%20wS1%2C%20bQ%2C%20wA2%2C%20etc.%0A%20%20%20*%20%40param%20%7BHiveGame%7D%20hive%20%20-%20The%20hive%20where%20this%20bug%20is%20in.%0A%20%20%20*%2F%0A%20%20constructor(bugName%2C%20hive)%20%7B%0A%20%20%20%20this._name%20%20%20%20%20%20%20%20%20%3D%20bugName%3B%0A%20%20%20%20this._bugType%20%20%20%20%20%20%3D%20bugName.charAt(1)%3B%0A%20%20%20%20this._hive%20%20%20%20%20%20%20%20%20%3D%20hive%3B%0A%20%20%20%20this._pos%20%20%20%20%20%20%20%20%20%20%3D%20undefined%3B%0A%20%20%20%20this._lastMovement%20%3D%20undefined%3B%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20%40return%20%7Bobject%7D%20Bug%20position%20in%20the%20form%20%7B%20x%3A%20NUMBER%2C%20y%3A%20NUMBER%20%7D%0A%20%20%20*%2F%0A%20%20get%20position()%20%7B%0A%20%20%20%20return%20this._pos%3B%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20Sets%20the%20position%20of%20this%20bug.%0A%20%20%20*%20Receives%20a%20bug%20position%20string%20in%20bga%20format%20and%20transform%0A%20%20%20*%20that%20into%20row%20and%20column.%0A%20%20%20*%2F%0A%20%20setPositionFromBga(bgaPos)%20%7B%0A%20%20%20%20bgaPos%20%3D%20bgaPos.replace(%22%5C%5C%22%2C%20%22%5C%5C%5C%5C%22)%3B%0A%20%20%20%20this._lastMovement%20%3D%20bgaPos%3B%0A%0A%20%20%20%20if%20(bgaPos%20%3D%3D%3D%20%22.%22)%20%7B%0A%20%20%20%20%20%20this._pos%20%3D%20%7B%20x%3A%2076%2C%20y%3A%2010%20%7D%3B%20%2F%2F%20Equivalent%20to%20position%20%22L%2010%22%20in%20BS%0A%20%20%20%20%7D%0A%20%20%20%20else%20%7B%0A%20%20%20%20%20%20bgaPos%20%3D%20bgaPos.replace(%22wL%22%2C%20%22wL1%22)%3B%0A%20%20%20%20%20%20bgaPos%20%3D%20bgaPos.replace(%22wP%22%2C%20%22wP1%22)%3B%0A%20%20%20%20%20%20bgaPos%20%3D%20bgaPos.replace(%22wM%22%2C%20%22wM1%22)%3B%0A%20%20%20%20%20%20bgaPos%20%3D%20bgaPos.replace(%22bL%22%2C%20%22bL1%22)%3B%0A%20%20%20%20%20%20bgaPos%20%3D%20bgaPos.replace(%22bP%22%2C%20%22bP1%22)%3B%0A%20%20%20%20%20%20bgaPos%20%3D%20bgaPos.replace(%22bM%22%2C%20%22bM1%22)%3B%0A%0A%20%20%20%20%20%20let%20matches%3B%0A%20%20%20%20%20%20let%20otherBugPos%3B%0A%0A%20%20%20%20%20%20%2F%2F%20TODO%3A%20This%20surely%20would%20require%20some%20explanation...%0A%20%20%20%20%20%20if%20(matches%20%3D%20bgaPos.match(%22%5E%2F(.*)%22))%20%7B%0A%20%20%20%20%20%20%20%20otherBugPos%20%20%20%3D%20this._hive.get(matches%5B1%5D).position%3B%0A%20%20%20%20%20%20%20%20this._pos%20%3D%20%7B%20x%3A%20otherBugPos.x%20-%201%2C%20y%3A%20otherBugPos.y%20-%201%20%7D%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20else%20if%20(matches%20%3D%20bgaPos.match(%2F%5E%5C%5C%7B2%7D(.*)%2F))%20%7B%0A%20%20%20%20%20%20%20%20otherBugPos%20%20%20%3D%20this._hive.get(matches%5B1%5D).position%3B%0A%20%20%20%20%20%20%20%20this._pos%20%3D%20%7B%20x%3A%20otherBugPos.x%2C%20y%3A%20otherBugPos.y%20%2B%201%20%7D%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20else%20if%20(matches%20%3D%20bgaPos.match(%22%5E-(.*)%22))%20%7B%0A%20%20%20%20%20%20%20%20otherBugPos%20%20%20%3D%20this._hive.get(matches%5B1%5D).position%3B%0A%20%20%20%20%20%20%20%20this._pos%20%3D%20%7B%20x%3A%20otherBugPos.x%20-%201%2C%20y%3A%20otherBugPos.y%20%7D%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20else%20if%20(matches%20%3D%20bgaPos.match(%22(.*)%3F%2F%24%22))%20%7B%0A%20%20%20%20%20%20%20%20otherBugPos%20%20%20%3D%20this._hive.get(matches%5B1%5D).position%3B%0A%20%20%20%20%20%20%20%20this._pos%20%3D%20%7B%20x%3A%20otherBugPos.x%20%2B%201%2C%20y%3A%20otherBugPos.y%20%2B%201%20%7D%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20else%20if%20(matches%20%3D%20bgaPos.match(%2F(.*)%5C%5C%7B2%7D%24%2F))%20%7B%0A%20%20%20%20%20%20%20%20otherBugPos%20%20%20%3D%20this._hive.get(matches%5B1%5D).position%3B%0A%20%20%20%20%20%20%20%20this._pos%20%3D%20%7B%20x%3A%20otherBugPos.x%2C%20y%3A%20otherBugPos.y%20-%201%20%7D%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20else%20if%20(matches%20%3D%20bgaPos.match(%22(.*)-%24%22))%20%7B%0A%20%20%20%20%20%20%20%20otherBugPos%20%20%20%3D%20this._hive.get(matches%5B1%5D).position%3B%0A%20%20%20%20%20%20%20%20this._pos%20%3D%20%7B%20x%3A%20otherBugPos.x%20%2B%201%2C%20y%3A%20otherBugPos.y%20%7D%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20else%20%7B%0A%20%20%20%20%20%20%20%20otherBugPos%20%20%20%3D%20this._hive.get(bgaPos).position%3B%0A%20%20%20%20%20%20%20%20this._pos%20%3D%20%7B%20x%3A%20otherBugPos.x%2C%20y%3A%20otherBugPos.y%20%7D%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20%40return%20%7Bstring%7D%20Last%20movement%20of%20this%20bug%20in%20common%20hive%20notation%0A%20%20%20*%2F%0A%20%20lastMovement()%20%7B%0A%20%20%20%20return%20this._lastMovement%3B%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20%40return%20%7Bstring%7D%20'pick'%20if%20the%20bug%20has%20not%20yet%20been%20places.%20Otherwise%0A%20%20%20*%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20will%20return%20'pickb'.%0A%20%20%20*%2F%0A%20%20bsPickCommand()%20%7B%0A%20%20%20%20if%20(this.position%20%3D%3D%3D%20undefined)%20%7B%0A%20%20%20%20%20%20return%20%22pick%22%3B%0A%20%20%20%20%7D%0A%20%20%20%20return%20%22pickb%22%3B%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20%40return%20%7Bstring%7D%20Position%20as%20it%20is%20used%20by%20BoardSpace.%0A%20%20%20*%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20(This%20is%3A%20%22LETTER%20NUMBER%22.%20For%20example%20%22L%2010%22)%0A%20%20%20*%2F%0A%20%20bsPosition()%20%7B%0A%20%20%20%20if%20(this.position%20%3D%3D%3D%20undefined)%20%7B%0A%20%20%20%20%20%20%2F%2F%20Bugs%20in%20the%20reserve%20come%20from%20some%20magic%20position%20in%20boardspace.%0A%20%20%20%20%20%20const%20bugIdx%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22Q%22%3A%200%2C%0A%20%20%20%20%20%20%20%20%22A%22%3A%201%2C%0A%20%20%20%20%20%20%20%20%22G%22%3A%202%2C%0A%20%20%20%20%20%20%20%20%22B%22%3A%203%2C%0A%20%20%20%20%20%20%20%20%22S%22%3A%204%2C%0A%20%20%20%20%20%20%20%20%22M%22%3A%205%2C%0A%20%20%20%20%20%20%20%20%22L%22%3A%206%2C%0A%20%20%20%20%20%20%20%20%22P%22%3A%207%0A%20%20%20%20%20%20%7D%3B%0A%20%20%20%20%20%20return%20this._name.charAt(0).toUpperCase()%20%2B%20%22%20%22%20%2B%20bugIdx%5Bthis._bugType%5D%3B%0A%0A%20%20%20%20%7D%0A%20%20%20%20return%20String.fromCodePoint(this.position.x)%20%2B%20%22%20%22%20%2B%20this.position.y%3B%0A%20%20%7D%0A%7D%0A%0A%2F**%0A%20*%20Class%20that%20represents%20a%20Hive%20Game.%0A%20*%20Mainly%20a%20bunch%20of%20bugs%20and%20a%20list%20of%20movements.%0A%20*%2F%0Aclass%20HiveGame%20%7B%0A%0A%20%20%2F**%0A%20%20%20*%20Creates%20a%20new%20Hive%20Game.%0A%20%20%20*%20%40param%20%7Bnumber%7D%20tableId%20%20-%20Table%20Id%20from%20BGA.%20Used%20for%20identification%20purposes.%0A%20%20%20*%20%40param%20%7Bstring%7D%20player_0%20-%20Name%20of%20first%20player.%0A%20%20%20*%20%40param%20%7Bstring%7D%20player_1%20-%20Name%20of%20second%20player.%0A%20%20%20*%2F%0A%20%20constructor(tableId%2C%20player_0%2C%20player_1)%20%7B%0A%20%20%20%20this._table_id%20%20%3D%20tableId%3B%0A%20%20%20%20this._player_0%20%20%3D%20player_0%3B%0A%20%20%20%20this._player_1%20%20%3D%20player_1%3B%0A%20%20%20%20this._bugs%20%20%20%20%20%20%3D%20%7B%7D%3B%0A%20%20%20%20this._player%20%20%20%20%3D%20%22P0%22%3B%0A%20%20%20%20this._movements%20%3D%20%5B%5D%3B%0A%20%20%20%20this._moveIdx%20%20%20%3D%201%3B%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20Gets%20a%20bug%20that%20matches%20the%20bug%20name%20from%20the%20Hive.%0A%20%20%20*%20It%20will%20create%20a%20new%20one%20if%20it%20does%20not%20exist%20yet.%0A%20%20%20*%0A%20%20%20*%20%40param%20%7Bstring%7D%20The%20bug%20you%20are%20looking%20for%20(wA1%2C%20wQ%2C%20bP1%2C%20etc)%0A%20%20%20*%20%40return%20%7BBug%7D%20The%20requested%20bug.%0A%20%20%20*%2F%0A%20%20get(bugName)%20%7B%0A%20%20%20%20this._bugs%20%3D%20this._bugs%20%7C%7C%20%7B%20%7D%3B%0A%0A%20%20%20%20if%20(!bugName.match(%2F%5Cd%2F)%20%26%26%20!bugName.match(%2FQ%2F))%20%7B%0A%20%20%20%20%20%20bugName%20%2B%3D%20%221%22%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20if%20(this._bugs%5BbugName%5D)%20%7B%0A%20%20%20%20%20%20return%20this._bugs%5BbugName%5D%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20const%20bug%20%3D%20new%20Bug(bugName%2C%20this)%3B%0A%20%20%20%20this._bugs%5BbugName%5D%20%3D%20bug%3B%0A%20%20%20%20return%20bug%3B%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20Well%2C%20just%20changes%20the%20current%20player.%0A%20%20%20*%20TODO%3A%20Probably%20this%20can%20be%20deleted%20or%20at%20least%20rewritten%20in%20a%20different%0A%20%20%20*%20manner.%0A%20%20%20*%2F%0A%20%20switchPlayer()%20%7B%0A%20%20%20%20if%20(this._player%20%3D%3D%3D%20%22P0%22)%20%7B%0A%20%20%20%20%20%20this._player%20%3D%20%22P1%22%3B%0A%20%20%20%20%7D%0A%20%20%20%20else%20%7B%0A%20%20%20%20%20%20this._player%20%3D%20%22P0%22%3B%0A%20%20%20%20%7D%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20Adds%20a%20movement%20and%20translates%20it%20into%20a%20more%20BS%20friendly%20way.%0A%20%20%20*%20%40param%20%7Bstring%7D%20bgaMove%20-%20Move%20as%20it%20is%20stored%20in%20BGA%20js%20variables.%0A%20%20%20*%2F%0A%20%20addMovement(bgaMove)%20%7B%0A%20%20%20%20console.debug(%60Adding%20movement%20%24%7BbgaMove%7D%60)%3B%0A%0A%20%20%20%20bgaMove%20%20%20%20%20%20%3D%20bgaMove.match(%2F%5C%5B%3F(.*%3F)%5C%5D%3F%24%2F)%5B1%5D%3B%0A%20%20%20%20const%20bug%20%20%20%20%3D%20this.get(bgaMove.split(%22%20%22)%5B0%5D.trim())%3B%0A%20%20%20%20const%20bgaPos%20%3D%20(bgaMove.split(%22%20%22)%5B1%5D%20%7C%7C%20%22.%22).trim()%3B%0A%0A%20%20%20%20const%20bsPick%20%3D%20%60%24%7Bbug.bsPickCommand()%7D%20%24%7Bbug.bsPosition()%7D%60%3B%0A%20%20%20%20bug.setPositionFromBga(bgaPos)%3B%0A%0A%20%20%20%20this._movements.push(%60%3B%24%7Bthis._player%7D%5B%24%7Bthis._moveIdx%2B%2B%7D%20%24%7BbsPick%7D%20%24%7Bbug._name%7D%5D%60)%3B%0A%20%20%20%20this._movements.push(%60%3B%24%7Bthis._player%7D%5B%24%7Bthis._moveIdx%2B%2B%7D%20dropb%20%24%7Bbug._name%7D%20%24%7Bbug.bsPosition()%7D%20%24%7Bbug.lastMovement()%7D%5D%60)%3B%0A%20%20%20%20this._movements.push(%60%3B%24%7Bthis._player%7D%5B%24%7Bthis._moveIdx%2B%2B%7D%20done%5D%60)%3B%0A%0A%20%20%20%20this.switchPlayer()%3B%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20In%20BGA%20wA2%20can%20appear%20before%20wA1%2C%20BS%20doesn't%20like%20that.%0A%20%20%20*%20Need%20to%20swap%20bugs%20in%20case%20they%20appear%20in%20the%20wrong%20order.%0A%20%20%20*%2F%0A%20%20_fixBugsOrder%20(gameStr)%20%7B%0A%20%20%20%20const%20toFix%20%3D%20%5B%22wA%22%2C%20%22wB%22%2C%20%22wG%22%2C%20%22wS%22%2C%20%22bA%22%2C%20%22bB%22%2C%20%22bG%22%2C%20%22bS%22%5D%3B%0A%0A%20%20%20%20for%20(let%20bug%20of%20toFix)%20%7B%0A%20%20%20%20%20%20let%20needReplacement%20%3D%20true%3B%0A%0A%20%20%20%20%20%20while%20(needReplacement)%20%7B%0A%20%20%20%20%20%20%20%20needReplacement%20%3D%20false%3B%0A%0A%20%20%20%20%20%20%20%20for%20(let%20i%20%3D%201%3B%20i%20%3C%3D%202%3B%20i%2B%2B)%20%7B%0A%20%20%20%20%20%20%20%20%20%20const%20bug1%20%20%20%3D%20bug%20%2B%20i%3B%0A%20%20%20%20%20%20%20%20%20%20const%20bug2%20%20%20%3D%20bug%20%2B%20(i%20%2B%201)%3B%0A%20%20%20%20%20%20%20%20%20%20const%20index1%20%3D%20gameStr.indexOf(bug1)%3B%0A%20%20%20%20%20%20%20%20%20%20const%20index2%20%3D%20gameStr.indexOf(bug2)%3B%0A%20%20%20%20%20%20%20%20%20%20const%20re1%20%3D%20new%20RegExp(bug1%2C%20%22g%22)%3B%0A%20%20%20%20%20%20%20%20%20%20const%20re2%20%3D%20new%20RegExp(bug2%2C%20%22g%22)%3B%0A%0A%20%20%20%20%20%20%20%20%20%20if%20(index2%20%3E%200)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(index1%20%3C%200)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20gameStr%20%3D%20gameStr.replace(re2%2C%20bug1)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20needReplacement%20%3D%20true%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20else%20if%20(index2%20%3C%20index1)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20gameStr%20%3D%20gameStr.replace(re2%2C%20%22SWAPME%22)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20gameStr%20%3D%20gameStr.replace(re1%2C%20bug2)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20gameStr%20%3D%20gameStr.replace(%2FSWAPME%2Fg%2C%20bug1)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20needReplacement%20%3D%20true%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20return%20gameStr%3B%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20Returns%20the%20game%20string%20in%20a%20format%20understandable%20by%20BoardSpace.%0A%20%20%20*%2F%0A%20%20getBsGame%20()%20%7B%0A%20%20%20%20let%20gameStr%20%3D%20%60(%3B%0A%20%20%20%20%20%20GM%5B27%5DVV%5B1%5D%0A%20%20%20%20%20%20SU%5Bhive-plm%5D%0A%20%20%20%20%20%20P0%5Bid%20%22%24%7Bthis._player_0%7D%22%5D%0A%20%20%20%20%20%20P1%5Bid%20%22%24%7Bthis._player_1%7D%22%5D%0A%20%20%20%20%20%20%3B%20P0%5B0%20Start%20P0%5D%0A%20%20%20%20%60%3B%0A%0A%20%20%20%20gameStr%20%2B%3D%20this._movements.join(%22%5Cn%22)%3B%0A%20%20%20%20gameStr%20%2B%3D%20%22%5Cn)%22%3B%0A%0A%20%20%20%20return%20this._fixBugsOrder(gameStr)%3B%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20%40return%20%7Bstring%7D%20Name%20for%20the%20game.%0A%20%20%20*%2F%0A%20%20getBsName%20()%20%7B%0A%20%20%20%20return%20%60bga2bs-%24%7Bthis._player_0%7D-%24%7Bthis._player_1%7D-%24%7Bthis._table_id%7D.sgf%60%3B%0A%20%20%7D%0A%7D%0A%0A%2F**%0A%20*%20Provides%20some%20static%20methods%20to%20deal%20with%20BoardGameArena.%0A%20*%2F%0Aclass%20BGA%20%7B%0A%20%20%2F**%0A%20%20%20*%20Get%20game%20log%20from%20BGA%20for%20a%20single%20table.%0A%20%20%20*%20%40param%20%7Bnumber%7D%20tableId%20%20%20%20-%20Table%20Id%20from%20BGA%20you%20want%20to%20process.%0A%20%20%20*%20%40param%20%7Bfunction%7D%20callback%20-%20Whatever%20you%20want%20to%20do%20with%20the%20game%20log.%0A%20%20%20*%2F%0A%20%20static%20getGame(tableId%2C%20callback)%20%7B%0A%20%20%20%20console.info(%60Getting%20game%20%24%7BtableId%7D%60)%3B%0A%0A%20%20%20%20const%20getGameLog%20%3D%20function%20()%20%7B%0A%20%20%20%20%20%20console.info(%60Getting%20game%20log%20%24%7BtableId%7D%60)%3B%0A%20%20%20%20%20%20dojo.xhrGet(%7B%0A%20%20%20%20%20%20%20%20url%3A%20%22https%3A%2F%2Fen.boardgamearena.com%2Farchive%2Farchive%2Flogs.html%22%2C%0A%20%20%20%20%20%20%20%20preventCache%3A%20true%2C%0A%20%20%20%20%20%20%20%20content%3A%20%7B%20table%3A%20tableId%2C%20translated%3A%20true%20%7D%2C%0A%20%20%20%20%20%20%20%20load%3A%20callback%0A%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%7D%3B%0A%0A%20%20%20%20dojo.xhrGet(%7B%0A%20%20%20%20%20%20url%3A%20%22https%3A%2F%2Fen.boardgamearena.com%2Fgamereview%22%2C%0A%20%20%20%20%20%20preventCache%3A%20true%2C%0A%20%20%20%20%20%20content%3A%20%7B%20table%3A%20tableId%2C%20refreshtemplate%3A%201%20%7D%2C%0A%20%20%20%20%20%20load%3A%20getGameLog%0A%20%20%20%20%7D)%3B%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20Parse%20game%20log%20from%20BGA.%0A%20%20%20*%20%40param%20data%20%7Bstring%7D%20-%20Game%20log%20from%20BGA.%0A%20%20%20*%20%40return%20%7BHiveGame%7D%20%20%20-%20HiveGame%20object%20created%20from%20the%20log.%0A%20%20%20*%2F%0A%20%20static%20parseGame(data)%20%7B%0A%20%20%20%20const%20table_id%20%3D%20data%5B0%5D.table_id%3B%0A%20%20%20%20const%20player_0%20%3D%20data%5B1%5D.data%5B0%5D.args.player_name%20%7C%7C%20data%5B3%5D.data%5B0%5D.args.player_name%3B%0A%20%20%20%20const%20player_1%20%3D%20data%5B2%5D.data%5B0%5D.args.player_name%20%7C%7C%20data%5B4%5D.data%5B0%5D.args.player_name%3B%0A%20%20%20%20const%20hiveGame%20%3D%20new%20HiveGame(table_id%2C%20player_0%2C%20player_1)%3B%0A%0A%20%20%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20data.length%3B%20i%2B%2B)%20%7B%0A%20%20%20%20%20%20const%20actions%20%3D%20data%5Bi%5D.data%3B%0A%20%20%20%20%20%20for%20(let%20j%20%3D%200%3B%20j%20%3C%20actions.length%3B%20j%2B%2B)%20%7B%0A%20%20%20%20%20%20%20%20const%20action%20%3D%20actions%5Bj%5D%3B%0A%20%20%20%20%20%20%20%20if%20(action.type%20%3D%3D%3D%20%22tokenPlayed%22)%20%7B%0A%20%20%20%20%20%20%20%20%20%20const%20bgaMove%20%3D%20action.args.notation%3B%0A%20%20%20%20%20%20%20%20%20%20if%20(bgaMove.match(%2F.*%20.*%2F))%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20hiveGame.addMovement(bgaMove)%3B%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20else%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20TODO%3A%20Change%20this.%20It%20does%20not%20make%20sense%20when%20you%20are%20in%20a%20list%20of%20games%0A%20%20%20%20%20%20%20%20%20%20%20%20alert(%22Cannot%20download%20game.%20I%20will%20redirect%20to%20gamereview%20page.%5CnTry%20again%20from%20there.%22)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20document.location%20%3D%20%60https%3A%2F%2Fen.boardgamearena.com%2F%23!gamereview%3Ftable%3D%24%7Btable_id%7D%60%3B%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20return%20hiveGame%3B%0A%20%20%7D%0A%7D%0A%0A%2F**%0A%20*%20Some%20utitlies%20I%20need%20to%20use.%0A%20*%2F%0Aclass%20Util%20%7B%0A%20%20%2F**%0A%20%20%20*%20Create%20a%20zip%20file%20with%20the%20games%20provided%20a%20download%20them.%0A%20%20%20*%20If%20there%20is%20only%20one%20game%20will%20return%20a%20single%20text%20file%20instead.%0A%20%20%20*%20%40hiveGames%20%7Barray%7D%20-%20Array%20containing%20hive%20games%20you%20want%20to%20download.%0A%20%20%20*%2F%0A%20%20static%20download(hiveGames)%20%7B%0A%20%20%20%20if%20(hiveGames.length%20%3D%3D%3D%201)%20%7B%0A%20%20%20%20%20%20const%20hiveGame%20%3D%20hiveGames%5B0%5D%3B%0A%20%20%20%20%20%20Util._downloadURI(%22data%3Atext%2Fplain%2C%22%20%2B%20encodeURIComponent(hiveGame.getBsGame())%2C%20hiveGame.getBsName())%3B%0A%20%20%20%20%7D%0A%20%20%20%20else%20%7B%0A%20%20%20%20%20%20require(%5B%22https%3A%2F%2Fstuk.github.io%2Fjszip%2Fdist%2Fjszip.js%22%5D%2C%20function(JSZip)%20%7B%0A%20%20%20%20%20%20%20%20const%20zip%20%20%20%20%3D%20new%20JSZip()%3B%0A%20%20%20%20%20%20%20%20const%20folder%20%3D%20zip.folder(%22games%22)%3B%0A%20%20%20%20%20%20%20%20hiveGames.forEach((game)%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20folder.file(game.getBsName()%2C%20game.getBsGame())%3B%0A%20%20%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%20%20%20%20zip.generateAsync(%7Btype%3A%22base64%22%7D).then(function(base64)%20%7B%0A%20%20%20%20%20%20%20%20%20%20Util._downloadURI(%22data%3Aapplication%2Fzip%3Bbase64%2C%22%20%2B%20base64%2C%20%22games.zip%22)%3B%0A%20%20%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%7D%0A%20%20%7D%0A%0A%20%20%2F**%0A%20%20%20*%20Helper%20method%20to%20download%20a%20string%20as%20a%20file.%0A%20%20%20*%2F%0A%20%20static%20_downloadURI(uri%2C%20name)%20%7B%0A%20%20%20%20const%20link%20%3D%20document.createElement(%22a%22)%3B%0A%20%20%20%20link.download%20%3D%20name%3B%0A%20%20%20%20link.href%20%3D%20uri%3B%0A%20%20%20%20document.body.appendChild(link)%3B%0A%20%20%20%20link.click()%3B%0A%20%20%20%20document.body.removeChild(link)%3B%0A%20%20%7D%0A%7D%0A%0Aif%20(document.URL.match(%2Farchive%5C%2Freplay%2F))%20%7B%0A%20%20const%20hiveGame%20%3D%20BGA.parseGame(g_gamelogs)%3B%0A%20%20Util.download(%5B%20hiveGame%20%5D)%3B%0A%7D%0Aelse%20if%20(document.URL.match(%2Fgamereview%2F))%20%7B%0A%20%20const%20table_id%20%20%3D%20document.URL.match(%2Ftable%3D(%5Cd%2B)%2F)%5B1%5D%3B%0A%20%20const%20players%20%20%20%3D%20document.getElementById(%22game_result%22).getElementsByClassName(%22name%22)%3B%0A%20%20const%20hiveGame%20%20%3D%20new%20HiveGame(table_id%2C%20players%5B0%5D.textContent%2C%20players%5B1%5D.textContent)%3B%0A%0A%20%20const%20movements%20%3D%20document.getElementsByClassName(%22gamelogreview%22)%3B%0A%20%20for%20(let%20i%20%3D%200%3B%20i%20%3C%20movements.length%3B%20i%2B%2B)%20%7B%0A%20%20%20%20const%20movement%20%3D%20movements%5Bi%5D.textContent%3B%0A%20%20%20%20const%20bgaMove%20%20%3D%20movement.match(%2F%5C%5B(.*)%5C%5D%2F)%3B%0A%20%20%20%20if%20(bgaMove)%20%7B%0A%20%20%20%20%20%20hiveGame.addMovement(bgaMove%5B1%5D.trim())%3B%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20Util.download(%5B%20hiveGame%20%5D)%3B%0A%7D%0Aelse%20if%20(document.URL.match(%2Fgamestats%2F))%20%7B%0A%20%20alert(%22This%20might%20take%20some%20time.%20Please%20wait%22)%3B%20%2F%2F%20TODO%3A%20Progress%20bar%20or%20something%0A%0A%20%20const%20allLinks%20%20%20%20%3D%20Array.from(document.getElementById(%22gamelist_inner%22).getElementsByTagName(%22a%22))%3B%0A%20%20const%20linkToGames%20%3D%20allLinks.filter(function%20(link)%20%7B%20return%20link.href.match(%2Ftable%2F)%3B%20%7D).slice(0%2C%20MAX_GAMES)%3B%0A%20%20const%20hiveGames%20%20%20%3D%20%5B%5D%3B%0A%0A%20%20const%20processLinks%20%3D%20function%20(linkList)%20%7B%0A%20%20%20%20const%20gameLink%20%3D%20linkList.pop()%3B%0A%20%20%20%20if%20(gameLink%20%3D%3D%3D%20undefined)%20%7B%0A%20%20%20%20%20%20Util.download(hiveGames)%3B%0A%20%20%20%20%7D%0A%20%20%20%20else%20%7B%0A%20%20%20%20%20%20const%20tableURL%20%3D%20gameLink.href%3B%0A%20%20%20%20%20%20const%20tableId%20%20%3D%20tableURL.match(%2F%5Cd%2B%2F)%5B0%5D%3B%0A%0A%20%20%20%20%20%20BGA.getGame(tableId%2C%20(textLog)%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20const%20json%20%3D%20JSON.parse(textLog)%3B%0A%20%20%20%20%20%20%20%20if%20(json.status%20%3D%3D%3D%20%220%22)%20%7B%0A%20%20%20%20%20%20%20%20%20%20console.error(%60Cannot%20get%20data%20for%20this%20table%20%24%7BtableId%7D%60)%3B%0A%20%20%20%20%20%20%20%20%20%20return%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20const%20log%20%3D%20json.data.data.data%3B%0A%20%20%20%20%20%20%20%20hiveGames.push(BGA.parseGame(log))%3B%0A%0A%20%20%20%20%20%20%20%20setTimeout(function()%20%7B%0A%20%20%20%20%20%20%20%20%20%20processLinks(linkList)%3B%0A%20%20%20%20%20%20%20%20%7D%2C%20REQUEST_INTERVAL)%3B%0A%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%7D%0A%20%20%7D%3B%0A%20%20processLinks(linkToGames)%3B%0A%7D%0Aelse%20if%20(document.URL.match(%2Fhive%5C%3Ftable%3D%5Cd%2B%2F))%20%7B%0A%20%20const%20tableId%20%20%20%3D%20document.URL.match(%2Fhive%5C%3Ftable%3D(%5Cd%2B)%2F)%5B1%5D%3B%0A%20%20const%20movements%20%3D%20Array.from(document.getElementById(%22logs%22).getElementsByClassName(%22log_replayable%22)).reverse()%3B%0A%20%20const%20player_0%20%20%3D%20movements%5B0%5D.getElementsByTagName(%22div%22)%5B0%5D.textContent.match(%2F(%5B%5E%5Cs%5D%2B)%5Cs%2F)%5B1%5D%3B%0A%20%20const%20player_1%20%20%3D%20movements%5B1%5D.getElementsByTagName(%22div%22)%5B0%5D.textContent.match(%2F(%5B%5E%5Cs%5D%2B)%5Cs%2F)%5B1%5D%3B%0A%20%20const%20hiveGame%20%20%3D%20new%20HiveGame(tableId%2C%20player_0%2C%20player_1)%3B%0A%0A%20%20if%20(movements%5B0%5D.getElementsByTagName(%22div%22)%5B0%5D.textContent.match(%2Fplaces%20a%20new%2F))%20%7B%0A%20%20%20%20alert(%22Please%20use%20Tournament%20style%20notation%22)%3B%0A%20%20%7D%0A%20%20else%20%7B%0A%20%20%20%20movements.forEach(%20m%20%3D%3E%20%7B%0A%20%20%20%20%20%20const%20text%20%20%20%20%3D%20m.getElementsByTagName(%22div%22)%5B0%5D.textContent%3B%0A%20%20%20%20%20%20const%20moveStr%20%3D%20text.match(%2F%5Cs(.%2B)%24%2F).pop()%3B%0A%20%20%20%20%20%20hiveGame.addMovement(moveStr)%3B%0A%20%20%20%20%7D)%3B%0A%20%20%20%20Util.download(%5B%20hiveGame%20%5D)%3B%0A%20%20%7D%0A%7D%7D)()%3B
