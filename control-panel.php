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
		<button id="load-controls">Open</button>
		<button id="new-controls">New</button>
		<button id="edit-controls">Edit</button>
		<button id="saveas-controls">Save As</button>
		<button id="refresh-controls">Refresh</button>
		<button id="help-profile" class="profile-help">Help</button>
	</div>
	<div id="profileNameDate">
		<div><span class="profileTableLabel">Profile Name:</span><span class="profileTableValue" id="profileTableName"></span></div>
		<div><span class="profileTableLabel">Start Date:</span><span class="profileTableValue" id="profileTableStartDate"></span></div>
	</div>
	<div id="profileChartDiv"></div>
	<div id="profileTableDiv"></div>
	<div id="profileSelectDiv">
		<div id="profileSelectChartDiv"><span class="chart-placeholder">Click a profile to load a preview here</span></div>
		<ol id="profileSelect"></ol>
		<div id="profileSelectTableDiv" style="display: none;"></div>
	</div>
	<div id="profileEditDiv">
		   <div id="profileEditChartDiv"><span class="chart-placeholder">Profile preview will be displayed here</span></div>
	       <div id="profileEditControls">
	       <div class="profileEditFieldSet">
               <div id="profileEditNameLabel" class="profileTableLabel edit">Profile Name:</div><input class="profileTableField" type="text" id="profileEditName" name="profileEditName" value="" />
               <div class="profileTableLabel edit">Start Date:</div><input class="profileTableField" type="text" id="profileEditStartDate" name="profileEditStartDate" value="" tabindex="-1" />
	       </div>
           <button class="halfwidth-button" type="button" id="profileEditNowButton">Start Now</button>
           <button class="halfwidth-button" type="button" id="profileEditAddCurrentButton">Insert Now</button>
	       <div id="profileSaveError">Error Saving Profile!</div>
	       </div>
	</div>
	<div id="profileHelpDiv">
		<p> A temperature profile is a set of timestamps and beer temperature settings. Between the points you define, the temperature is interpolated.
			Using profile mode, you can easily do slow temperature increases/decreases, for example: set the temperature to 20 degrees on day 1 and 23 on day 4.
			This will result in a temperature of 22 degrees on day 3.
		</p>
		<span class="help-h1">Open</span>
		<p>
			The <i>Open</i> button shows a list of saved profiles. Clicking them loads the profile in the web interface, but does <span
				style="text-decoration: underline;">not</span> activate it yet. When you hit 'Apply', the profile is set as active and the script will start following it.
			Remember to change the start date when loading an old profile!
		</p>
		<span class="help-h1">New</span>
		<p>
			When you click the <i>New</i> button, a dialog will open where you can enter a name for the profile and add temperature points. Decimals are allowed in both columns!
		</p><p>
			You can right-click on a row to insert a new row or to delete the row. There will always be an empty row at the bottom too.
		</p><p>
			The <i>Start Now</i> button sets the start date of the profile to the current date on your computer. Make sure your Pi and your computer are in sync.
		</p><p>
			The <i>Insert Now</i> button adds a new point to the profile at the current date and the current beer temperature setting.
			This allows you to change a running profile 'from now on', while not changing the part of the profile that already passed.
		</p><p>
			When you are done with your profile, click <i>Save</i>. This will save the profile on the Raspberry Pi and load it in the web interface.
		</p>
		<p>Note: The table is kept sorted based on the Date and Time column. The 'Date and Time' column cannot be edited directly: it is calculated from the start date and the Day column.</p>
		<span class="help-h1">Edit</span>
		<p>
			The <i>Edit profile</i> button allows you to the edit the currently loaded profile.
		</p>
		<span class="help-h1">Save As</span>
		<p>
			The <i>Save As</i> opens the same dialog as the Edit button, but allows you to save under a new name after editing.
		</p>
		<span class="help-h1">Refresh</span>
		<p>
			The refresh button can be useful if you edited the profile outside of the web interface: it reloads the profile from the Raspberry Pi.
		</p>
		<span class="help-h1">Final notes..</span>
		<p>
			If your start date is in the future, BrewPi will use the first temperature in the profile. If your last date is in the past, BrewPi will use the last temperature.
		</p><p>
			You can leave a temperature cell empty to temporarily disable temperature control in profile mode.
			You can start a profile with an empty temperature cell at day 0 to postpone starting temperature control or you can end with an empty cell to disable temperature control after a while.
		</p><p>
			Take into account that your points define 'line pieces', to end with 22 degrees for a while and then OFF you define: 22, 22, empty.
		</p><p>
			It might sound a bit complicated now, but just play around with the editor a bit and look at the changes in the chart. It is not as complicated as it sounds here.
		</p>
	</div>
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
