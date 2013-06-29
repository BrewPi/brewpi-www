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

<ul>
	<div id="control-bar-text">
		<div id="set-mode-text">Set temperature mode:</div>
		<div id="status-text">Status:</div>
	</div>
	<li><a href="#profile-control"><span>Beer profile</span></a></li>
	<li><a href="#beer-constant-control"><span>Beer constant</span></a></li>
	<li><a href="#fridge-constant-control"><span>Fridge constant</span></a></li>
	<li><a href="#temp-control-off"><span>Off</span></a></li>
	<button id="apply-settings">Apply</button>
	<div id="status-message" class="ui-state-error ui-corner-all">
		<p>
			<span id="icon" class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>
			<span id="message">Not loaded</span>
		</p>
	</div>
</ul>
<div id="profile-control">
	<div id="controls">
		<button id="refresh-controls">Refresh</button>
		<button id="edit-controls">Edit profile</button>
	</div>
	<style>
	       #profileTableEditDiv { display:none; }
	       .profileTableLabel { display:inline-block; width:75px; }
	       .profileTableField { display:inline-block; width:170px; }
	       .profileTableEdit { margin:10px; border:1px solid #ccc; border-right: 0px; border-bottom: 0px; }
	       .profileTableEdit TR.odd { background:#eee; }
	       .profileTableEdit TR.even { background:#fff; }
	       .profileTableEdit tbody TR:hover { background:#ddd; }
	       .profileTableEdit TD, .profileTableEdit TH { text-align:right; padding:10px; }
	       .profileTableEdit TD { border-bottom: solid 1px #ccc; border-right: solid 1px #ccc; }
	       .profileTableEdit TH { border-right: solid 1px #fff; }
	       .profileTableEdit TH:last-child { border-right: 0px }
	</style>
	<div id="profileTableEditDiv">
	       <div>
	               <div class="profileTableLabel">Beer Name:</div><input class="profileTableField" type="text" id="profileTableBeerName" name="profileTableStartDate" valu
	               <div class="profileTableLabel">Start Date:</div><input class="profileTableField" type="text" id="profileTableStartDate" name="profileTableStartDate" va
	       </div>
	       <div id="profileTableTempsDiv"></div>
	</div>
	<div id="profileChartDiv" style="width: 375px;  height: 280px; float: left"></div>
	<div id="profileTableDiv" style="width: 400px;	height: 280px; float: right"></div>
</div>
<div id="beer-constant-control">
	<div id="beer-temp" class="temp-display">
		<div class="temp-container"></div>
		<button id="beer-temp-up" class="temp-up"></button>
		<input class='temperature' /><span class='degree'>&deg;<?php echo $tempFormat ?></span>
		<button id="beer-temp-down" class="temp-down"></button>
	</div>
</div>
<div id="fridge-constant-control">
	<div id="fridge-temp" class="temp-display">
		<div class="temp-container"></div>
		<button id="fridge-temp-up" class="temp-up"></button>
		<input class='temperature' /><span class='degree'>&deg;<?php echo $tempFormat ?></span>
		<button id="fridge-temp-down" class="temp-down"></button>
	</div>
</div>
<div id="temp-control-off">
	<span id="temp-off-text">Temperature control disabled. Fridge will not cool or heat, but will still log temperatures.</span>
</div>
