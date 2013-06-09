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
<div class="chart-container">
    <div id="curr-beer-chart-label" class="beer-chart-label"></div>
    <div id="curr-beer-chart" class="beer-chart"></div>
	<div id="curr-beer-chart-controls" class="beer-chart-controls" style="visibility: hidden">
		<button id="refresh-curr-beer-chart"></button>
		<button class="toggle-line-0" onClick="toggleLine(this)">
		<button class="toggle-line-1" onClick="toggleLine(this)">
		<button class="toggle-line-2" onClick="toggleLine(this)">
		<button class="toggle-line-3" onClick="toggleLine(this)">
		<button class="toggle-line-4" onClick="toggleLine(this)">
	</div>
</div>
