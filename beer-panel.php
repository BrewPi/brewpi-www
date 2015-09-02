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
	<div id="lcd" class="lcddisplay">
        <span class="lcd-text">
            <span class="lcd-line" id="lcd-line-0">Live LCD waiting</span>
            <span class="lcd-line" id="lcd-line-1">for update from</span>
            <span class="lcd-line" id="lcd-line-2">script...</span>
            <span class="lcd-line" id="lcd-line-3"></span>
        </span>
	</div>
	<div id="logo-container">
		<img src="brewpi_logo.png">
		<div id=beer-name-container>
			<span>Fermenting: </span><a href='#' id="beer-name"><?php echo urldecode($beerName);?></a>
			<span class="data-logging-state"></span>
		</div>
	</div>
	<button class="script-status ui-state-error"></button>
	<button id="maintenance" class="ui-state-default">Maintenance panel</button>
</div>
<div class="chart-container">
    <div id="curr-beer-chart-label" class="beer-chart-label"></div>
    <div id="curr-beer-chart" class="beer-chart" style="width:815px; height:390px"></div>
	<div id="curr-beer-chart-controls" class="beer-chart-controls" style="display: none">
	    <div id="curr-beer-chart-buttons" class="beer-chart-buttons">
	    	<div class="beer-chart-legend-row">
				<button class="refresh-curr-beer-chart" title="Refresh"></button>
	    		<div class="beer-chart-legend-label">Refresh Chart</div>
	    		<br class="crystal" />
	    	</div>
	    	<div class="beer-chart-legend-row last">
				<button class="chart-help" title="Help"></button>
	    		<div class="beer-chart-legend-label">Help</div>
    			<br class="crystal" />
	    	</div>
		</div>
	    <div id="curr-beer-chart-legend" class="beer-chart-legend">
	    	<div class="beer-chart-legend-row time">
	    		<div class="beer-chart-legend-time">Date/Time</div>
	    	</div>
	    	<div class="beer-chart-legend-row beerTemp">
	    		<div class="toggle beerTemp" onClick="toggleLine(this)"></div>
	    		<div class="beer-chart-legend-label" onClick="toggleLine(this)">Beer Temp</div>
	    		<div class="beer-chart-legend-value">--</div>
	    		<br class="crystal" />
	    	</div>
	    	<div class="beer-chart-legend-row beerSet">
				<div class="toggle beerSet" onClick="toggleLine(this)"></div>
	    		<div class="beer-chart-legend-label" onClick="toggleLine(this)">Beer Setting</div>
	    		<div class="beer-chart-legend-value">--</div>
	    		<br class="crystal" />
	    	</div>
	    	<div class="beer-chart-legend-row fridgeTemp">
				<div class="toggle fridgeTemp" onClick="toggleLine(this)"></div>
	    		<div class="beer-chart-legend-label" onClick="toggleLine(this)">Fridge Temp</div>
	    		<div class="beer-chart-legend-value">--</div>
	    		<br class="crystal" />
	    	</div>
	    	<div class="beer-chart-legend-row fridgeSet">
				<div class="toggle fridgeSet" onClick="toggleLine(this)"></div>
	    		<div class="beer-chart-legend-label" onClick="toggleLine(this)">Fridge Setting</div>
	    		<div class="beer-chart-legend-value">--</div>
	    		<br class="crystal" />
	    	</div>
	    	<div class="beer-chart-legend-row roomTemp">
				<div class="toggle roomTemp" onClick="toggleLine(this)"></div>
	    		<div class="beer-chart-legend-label" onClick="toggleLine(this)">Room Temp</div>
	    		<div class="beer-chart-legend-value">--</div>
	    		<br class="crystal" />
	    	</div>
	    	<div class="beer-chart-legend-row state">
				<div class="state-indicator"></div>
	    		<div class="beer-chart-legend-label"></div>
	    		<br class="crystal" />
	    	</div>
	    	<div class="beer-chart-legend-row annotation last">
				<div class="toggleAnnotations dygraphDefaultAnnotation" onClick="toggleAnnotations(this)">A</div>
	    		<div class="beer-chart-legend-label" onClick="toggleAnnotations(this)">Annotations</div>
	    		<br class="crystal" />
	    	</div>
	    </div>
	</div>
</div>
<div id="chart-help-popup" title="Beer graph help" style="display: none">
	<p>This chart displays all temperatures and state information logged by BrewPi.
		Not all temperatures are shown by default, but you can toggle them with the colored dots.</p>
	<p>Click and drag left or right to zoom horizontally, click and drag up or down to zoom vertically. Double click to zoom out.
		When zoomed in, you can hold shift to pan around. On your phone or tablet you can just pinch to zoom.</p>
	<p>The state information is shown as colored bars at the bottom of the graph, explanation below.</p>
	<div class="state-info"><span class="state-color state-idle"></span><span class="state-name">Idle</span>
		<span class="state-explanation">
			No actuator is active.
		</span>
	</div>
	<div class="state-info">
		<span class="state-color state-cooling"></span><span class="state-name">Cooling</span>
		<span class="state-explanation">
			The fridge is cooling!
		</span>
	</div>
	<div class="state-info"><span class="state-color state-heating"></span><span class="state-name">Heating</span>
		<span class="state-explanation">
			The heater is heating!
		</span>
	</div>
	<div class="state-info"><span class="state-color state-waiting-to-cool"></span><span class="state-name">Waiting to cool</span>
		<span class="state-explanation">
			The fridge is waiting to start cooling. It has to wait because BrewPi has just cooled or heated. There is a a minimum time for between cool cycles and a minimum time for switching from heating to cooling.
		</span>
	</div>
	<div class="state-info"><span class="state-color state-waiting-to-heat"></span><span class="state-name">Waiting to heat</span>
		<span class="state-explanation">
			Idem for heating. There is a a minimum time for between heat cycles and a minimum time for switching from cooling to heating.
		</span>
	</div>
	<div class="state-info"><span class="state-color state-cooling-min-time"></span><span class="state-name">Cooling minimum time</span>
		<span class="state-explanation">
			There is a minimum on time for each cool cycle. When the fridge hits target but has not cooled the minimum time, it will continue cooling until the minimum time has passed.
		</span>
	</div>
	<div class="state-info"><span class="state-color state-heating-min-time"></span><span class="state-name">Heating minimum time</span>
		<span class="state-explanation">
			There is a minimum on time for each heat cycle too. When the fridge hits target but has not heated the minimum time, it will continue heating until the minimum time has passed.
		</span>
	</div>
	<div class="state-info"><span class="state-color state-waiting-peak"></span><span class="state-name">Waiting for peak detect</span>
		<span class="state-explanation">
			BrewPi estimates fridge temperature overshoot to be able to turn off the actuators early. To adjust the estimators, it has to detect the peaks in fridge temperature.
			When BrewPi would be allowed to heat/cool by the time limits but no peak has been detected yet for previous cycle, it waits in this state for a peak.
		</span>
	</div>
</div>

