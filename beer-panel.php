<?php
/* Copyright 2012 BrewPi/Elco Jacobs.
 * This file is part of BrewPi.

 * BrewPi is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * BrewPi is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with BrewPi.  If not, see <http://www.gnu.org/licenses/>.
 */
?>

<div id="top-bar" class="ui-widget ui-widget-header ui-corner-all">
	<div id="lcd" class="lcddisplay"><span class="lcd-text">
		<span class="lcd-line" id="lcd-line-0">Live LCD waiting</span>
		<span class="lcd-line" id="lcd-line-1">for update from</span>
		<span class="lcd-line" id="lcd-line-2">script...</span>
		<span class="lcd-line" id="lcd-line-3"></span>
	</div>
	<div id="logo-container">
		<img src="brewpi_logo.png">
		<span id="beername">Fermenting: <?php echo $beerName;?></span>
	</div>
	<button class="script-status ui-state-error"></button>
	<button id="maintenance">Maintenance panel</button>
</div>
<div id="chart-container">
    <div id="beer-chart-controls" style="visibility: hidden">
        <p><span class="displayLabel">Display: </span>
            <input type=checkbox id=0 onClick="change(this)" checked>
            <label class="beerTemp" for="0">Beer Temp</label>
            <input type=checkbox id=1 onClick="change(this)" checked>
            <label class="beerSet" for="1">Beer Set</label>
            <input type=checkbox id=2 onClick="change(this)" checked>
            <label class="fridgeTemp" for="2">Fridge Temp</label>
            <input type=checkbox id=3 onClick="change(this)" checked>
            <label class="fridgeSet" for="3">Fridge Set</label>
            <input type=checkbox id=4 onClick="change(this)" checked>
            <label class="roomTemp" for="4">Room Temp</label>
        </p>
    </div>
    <div id="beer-chart-label"></div>
    <div id="beer-chart"></div>
    <button id="refresh-beer-chart"></button>
</div>