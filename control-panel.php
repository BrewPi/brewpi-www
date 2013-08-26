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
		<button id="load-controls">Load profile</button>
		<button id="new-controls">New profile</button>
		<button id="edit-controls">Edit profile</button>
		<button id="help-profile" class="profile-help">Help</button>
	</div>
	<div id="profileNameDate">
		<div><span class="profileTableLabel">Profile Name:</span><span class="profileTableValue" id="profileTableName"></span></div>
		<div><span class="profileTableLabel">Start Date:</span><span class="profileTableValue" id="profileTableStartDate"></span></div>
	</div>
	<div id="profileChartDiv"></div>
	<div id="profileTableDiv"></div>
	<div id="profileSelectDiv">
		<ol id="profileSelect"></ol>
	</div>
	<div id="profileEditDiv">
	       <div class="profileEditFieldSet">
               <div id="profileEditNameLabel" class="profileTableLabel edit">Profile Name:</div><input class="profileTableField" type="text" id="profileEditName" name="profileEditName" value="" />
               <div class="profileTableLabel edit">Start Date:</div><input class="profileTableField" type="text" id="profileEditStartDate" name="profileEditStartDate" value="" />
	       </div>
           <button class="halfwidth-button" type="button" id="profileEditNowButton">Start Now</button>
           <button class="halfwidth-button" type="button" id="profileEditAddCurrentButton">Insert Now</button>
	       <div id="profileSaveError">Error Saving Profile!</div>
	       <div id="profileTableTempsDiv"></div>
	</div>
	<div id="profileHelpDiv">
		<p> With BrewPi running in profile mode, you can set a temperature profile ahead of time and BrewPi will follow this profile for you.
		    A profile consists of a list of day and temperature points and a start date. Between these points, the temperature setting is interpolated.
		</p><p>
			When running in profile mode, the BrewPi python script on the Raspberry Pi will continuously update the beer temperature setting on Arduino.
		</p>
		<span class="help-h1">Saving and loading profiles</span>
		<p>
			Temperature profiles are stored on the Raspberry Pi when you click the <i>Save</i> button.
			The <i>Load profile</i> button shows a list of saved profiles. Clicking them loads the profile in the web interface, but does <u>not</u> activate it yet.
		</p>
		<span class="help-h1">Creating a new profile</span>
		<p>
			When you click the <i>New profile</i> button, a dialog will open where you can enter a name for the profile and add temperature points. Decimals are allowed in both columns.
			The table is kept sorted based on the date column. The 'Date/Time' column cannot be edited directly: it is calculated from the start date and the first column.
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
		<span class="help-h1">Editing a profile</span>
		<p>
			The <i>Edit profile</i> button allows  you to the edit the profile that has been loaded in the web interface.
			The interface is the same as the 'New Profile' dialog, so you can overwrite the current profile or save it under a new name.
		</p>
		<span class="help-h1">Refresh</span>
		<p>
			The refresh button can be useful if you edited the profile outside of the web interface, it reloads the profile from the Raspberry Pi.
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
