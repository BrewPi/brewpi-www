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

function echoFilterSelect($filterName){
	echo "<select name=" . $filterName . " class=\"cc " . $filterName . "\">";
	// These values assume a sample frequency of 1 hz and 3 cascaded filters. Delay time below is in nr of samples for a single section
	echo "<option value=0>   9 seconds</option>"; // a=4,	b=0,	delay time = 3
	echo "<option value=1>  18 seconds</option>"; // a=6,	b=1,	delay time = 6
	echo "<option value=2>  39 seconds</option>"; // a=8,	b=2,	delay time = 13
	echo "<option value=3>  78 seconds</option>"; // a=10,	b=3,	delay time = 26
	echo "<option value=4> 159 seconds</option>"; // a=12,	b=4,	delay time = 53
	echo "<option value=5> 318 seconds</option>"; // a=14,	b=5,	delay time = 106
	echo "<option value=6> 639 seconds</option>"; // a=16,	b=6,	delay time = 213
	echo "</select>";
}

# slope filters are updated every 3 seconds, so have different delay time
function echoSlopeFilterSelect($filterName){
	echo "<select name=" . $filterName . " class=\"cc " . $filterName . "\">";
	echo "<option value=0>  27 seconds</option>"; // a=4,	b=0,	delay time = 3
	echo "<option value=1>  54 seconds</option>"; // a=6,	b=1,	delay time = 6
	echo "<option value=2>   2 minutes</option>"; // a=8,	b=2,	delay time = 13
	echo "<option value=3>   4 minutes</option>"; // a=10,	b=3,	delay time = 26
	echo "<option value=4>   8 minutes</option>"; // a=12,	b=4,	delay time = 53
	echo "<option value=5>  16 minutes</option>"; // a=14,	b=5,	delay time = 106
	echo "<option value=6>  32 minutes</option>"; // a=16,	b=6,	delay time = 213
	echo "</select>";
}

function echoYesNoSelect($optionName){
	echo "<select name=" . $optionName . " class=\"cc " . $optionName . "\">";
	echo "<option value=1> Yes</option>";
	echo "<option value=0>  No</option>";
	echo "</select>";
}
function echoRotarySelect($optionName){
	echo "<select name=" . $optionName . " class=\"cc " . $optionName . "\">";
	echo "<option value=0> Full step</option>";
	echo "<option value=1> Half step</option>";
	echo "</select>";
}
?>
<ul>
	<button class="script-status"></button>
	<li><a href="#settings"><span class="setting-name">Settings</span></a></li>
	<li><a href="#view-logs"><span>View logs</span></a></li>
	<li><a href="previous_beers.php"><span>Previous Beers</span></a></li>
	<li><a href="#control-algorithm"><span>Control Algorithm</span></a></li>
	<li><a href="#device-config"><span>Device Configuration</span></a></li>
	<li><a href="#advanced-settings"><span>Advanced Settings</span></a></li>
	<li><a href="#reprogram-arduino"><span>Reprogram Arduino</span></a></li>
	<!--kinda dirty to have buttons in the ul, but the ul is styled as a nice header by jQuery UI -->
</ul>
<div id="reprogram-arduino">
	<p>Here you can upload a HEX file which will be uploaded to the Arduino by the Python script.
		The script will automatically restart itself after programming.
		Just hit the back button on your browser to continue running BrewPi.</p>
	<div id = "program-container">
		<!-- This form has a hidden iFrame as target, so the full page is not refreshed -->
		<form action="program_arduino.php" method="post" enctype="multipart/form-data" target="upload-target">
			<div id="program-options">
				<div class="program-option">
					<label for="file">Hex file:</label>
					<input type="file" name="file" id="file" /> <!-- add max file size?-->
				</div>
				<div class="program-option">
					<label for="boardType"> Board type:</label>
					<select name="boardType">
						<option value="leonardo">Leonardo</option>
						<option value="uno">Uno</option>
						<option value="atmega328">ATmega328 based</option>
						<option value="diecimila">Atmega168 based</option>
						<option value="mega2560">Mega 2560</option>
						<option value="mega">Mega 1280</option>
					</select>
				</div>
				<div class="program-option">
					<label for="restoreSettings">Restore old settings after programming</label>
					<input type="radio" name="restoreSettings" value="true" checked>Yes
					<input type="radio" name="restoreSettings" value="false">No
				</div>
				<div class="program-option">
					<label for="restoreDevices">Restore installed devices after programming</label>
					<input type="radio" name="restoreDevices" value="true" checked>Yes
					<input type="radio" name="restoreDevices" value="false">No
				</div>
			</div>
			<input id="program-submit-button" type="submit" name="Program" value="Program">
		</form>

		<h3 id="program-stderr-header">Script stderr output will auto-refresh while programming if you keep this tab open</h3>
		<div class="stderr console-box"></div>
		<iframe id="upload-target" name="upload-target" src="about:blank" style="width:0;height:0;border:0px solid #fff;"></iframe>
	</div>
</div>
<div id="settings">
	<div class="settings-container">
		<div class="setting-container">
			<span class="setting-name">Log data point every:</span>
			<select id="interval">
			  <option value="30">30 Seconds</option>
			  <option value="60">1 Minute</option>
			  <option value="120">2 Minutes</option>
			  <option value="300">5 Minutes</option>
			  <option value="600">10 Minutes</option>
			  <option value="1800">30 Minutes</option>
			  <option value="3600">1 hour</option>
			</select>
			<button id="apply-interval" class="apply-button">Apply</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Profile name:</span>
			<input id="profile-name" value="<?php echo urldecode($profileName) ?>" size=30 type="text">
			<button class="apply-profile-name apply-button">Apply</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Date format:</span>
			<select id="datetime-format-display">
				<option <?php if ($dateTimeFormatDisplay == "mm/dd/yy") echo "selected=\"selected\""; ?>>mm/dd/yy</option>
				<option <?php if ($dateTimeFormatDisplay == "dd/mm/yy") echo "selected=\"selected\""; ?>>dd/mm/yy</option>
			</select>
			<button class="apply-datetime-format-display apply-button">Apply</button>
		</div>
	</div>
</div>
<div id="control-algorithm">
	<div class = "header ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">
		<span class='container-title'>PID algorithm for fridge setting</span>
		<button class="cs update-from-arduino">Update control settings</button>
		<button class="cv update-from-arduino">Update control variables</button>
		<button class="cc update-from-arduino">Update control constants</button>
	</div>
	<div class="algorithm-container ui-widget-content ui-corner-all">
		<div class="help-panel">
			<p>
				The red values are control settings. The beer setting is set by the profile or constant. The fridge setting is set by PID or constant.
				</br>
				The orange values are control variables. These are intermediate results of the fridge setting calculation.
				</br>
				The blue values are constants, they never change automatically.
			</p>
		</div>
		<div class="equation">
			<div class="cv beerDiff"><span class="name">Beer temp. error</span><span class="val"></span></div>
			<span class="operator multiply">*</span>
			<div class="cc Kp"><span class="name">Kp</span><span class="val"></span></div>
			<span class="operator equals">=</span>
			<div class="cv p"><span class="name">P</span><span class="val"></span></div>
		</div>
		<div class="equation">
			<div class="cv diffIntegral"><span class="name">Beer temp. error integral</span><span class="val"></span></div>
			<span class="operator multiply">*</span>
			<div class="cc Ki"><span class="name">Ki</span><span class="val"></span></div>
			<span class="operator equals">=</span>
			<div class="cv i"><span class="name">I</span><span class="val"></span></div>
		</div>
		<div class="equation">
			<div class="cv beerSlope"><span class="name">Beer temp. derivative</span><span class="val"></span></div>
			<span class="operator multiply">*</span>
			<div class="cc Kd"><span class="name">Kd</span><span class="val"></span></div>
			<span class="operator equals">=</span>
			<div class="cv d"><span class="name">D</span><span class="val"></span></div>
		</div>
		<div class="sum-line"><div class="line"></div><span class="operator plus">+</span></div>
		<div class="equation">
			<div class="cs beerSet"><span class="name">Beer Setting</span><span class="val"></span></div>
			<span class="operator plus">+</span>
			<div class="cv pid-result"><span class="name">P + I + D</span><span class="val"></span></div>
			<span class="operator equals">=</span>
			<div class="cs fridgeSet"><span class="name">FridgeSetting</span><span class="val"></span></div>
		</div>
	</div>
	<div class = "header ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">
		<span class='container-title'>Predictive ON/OFF and peak detection</span>
		<button class="cs update-from-arduino">Update control settings</button>
		<button class="cv update-from-arduino">Update control variables</button>
		<button class="cc update-from-arduino">Update control constants</button>
	</div>
	<div class="algorithm-container ui-widget-content ui-corner-all">
		<div class="help-panel">
			<p>
				The heater and cooler are controlled by a predictive on-off algorithm.
				BrewPi estimates the overshoot that would happen when it would go to IDLE. When that lands on the target temperature, it goes to IDLE.
				The overshoot is estimated as time active in hours * estimator.
				BrewPi detects the actual peaks and compares them to the prediction to automatically adjusts the estimators.
				You can change them manually in 'advanced settings' when they are far off.
			</p>
		</div>
		<div class="on-off-parameters">
			<div class="cv estPeak"><span class="name">Estimated peak</span><span class="val"></span></div>
			<div class="cv negPeak"><span class="name">Last detected negative peak</span><span class="val"></span></div>
			<div class="cv negPeakEst"><span class="name">Last target for negative peak</span><span class="val"></span></div>
			<div class="cv posPeak"><span class="name">Last detected positive peak</span><span class="val"></span></div>
			<div class="cv posPeakEst"><span class="name">Last target for positive peak</span><span class="val"></span></div>
			<div class="cs coolEst"><span class="name">Cooling overshoot estimator</span><span class="val"></span></div>
			<div class="cs heatEst"><span class="name">Heating overshoot estimator</span><span class="val"></span></div>
		</div>
	</div>
</div>
<div id="advanced-settings">
	<div class = "header ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">
		<span class='container-title'>Control settings</span>
		<button class="cs load-defaults">Reload defaults</button>
		<button class="cs receive-from-script">Receive from script</button>
		<button class="cs update-from-arduino">Update from Arduino</button>
	</div>
	<div id="control-settings-container" class="ui-widget-content ui-corner-all">
		<div class="setting-container">
			<span class="setting-name">Mode</span>
			<span class="explanation">Active temperature control mode. Use to control panel to switch (apply button).</span>
			<select name="mode" class="cs mode">
				<option value="b">Beer Constant</option>
				<option value="p">Beer Profile</option>
				<option value="f">Fridge Constant</option>
				<option value="o">Off</option>
			</select>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Beer Temperature Setting</span>
			<span class="explanation">Beer temperature setting when in profile or beer constant mode. Use the control panel to adjust.</span>
			<input type="text" name="beerSet" class="cs beerSet">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Fridge Temperature Setting</span>
			<span class="explanation">Automatically adjust when in profile/beer constant mode. Use the control panel to adjust.</span>
			<input type="text" name="fridgeSet" class="cs fridgeSet">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Cooling overshoot estimator</span>
			<span class="explanation">This is a self learning estimator for the overshoot when turning the cooler off.
			It is adjusted automatically, but you can set adjust it manually here. This does not stop further automatic adjustment.</span>
			<input type="text" name="coolEst" class="cs coolEst">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Heating overshoot estimator</span>
			<span class="explanation">This is a self learning estimator for the overshoot when turning the heater off.
			It is adjusted automatically, but you can set adjust it manually here. This does not stop further automatic adjustment.</span>
			<input type="text" name="heatEst" class="cs heatEst">
			<button class="send-button">Send to Arduino</button>
		</div>
	</div>
	<div class = "header ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">
		<span class='container-title'>Control constants</span>
		<button class="cc load-defaults">Reload defaults</button>
		<button class="cc receive-from-script">Receive from script</button>
		<button class="cc update-from-arduino">Update from Arduino</button>
	</div>
	<div id="control-constants-container" class="ui-widget-content ui-corner-all">
		<div class="setting-container">
			<span class="setting-name">Temperature format</span>
			<span class="explanation">Switch your temperature format here. The algorithm always uses fixed point Celcius format internally,
				but it converts all settings that go in or out to the right format.</span>
			<select name="tempFormat" class="cc tempFormat">
				<option value="C">Celsius</option>
				<option value="F">Fahrenheit</option>
			</select>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Temperature setting minimum</span>
			<span class="explanation">The fridge and beer temperatures cannot go below this value.</span>
			<input type="text" name="tempSetMin" class="cc tempSetMin">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Temperature setting maximum</span>
			<span class="explanation">The fridge and beer temperatures cannot go above this value.</span>
			<input type="text" name="tempSetMax" class="cc tempSetMax">
			<button class="send-button">Send to Arduino</button>
		</div>
		<span class="section-explanation">The fridge temperature is controlled with PID. The fridge setting = beer setting + PID.
			The proportional part is linear with the temperature error.
			The integral part slowly increases when an error stays present, this prevents steady state errors.
			The derivative part is in the opposite direction to the proportional part. This prevents overshoot: it lowers the PID value when there's 'momentum' in the right direction.
		</span>
		<div class="setting-container">
			<span class="setting-name">PID: Kp</span>
			<span class="explanation">The beer temperature error is multiplied by Kp to give the proportional part of the PID value.</span>
			<input type="text" name="Kp" class="cc Kp">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">PID: Ki</span>
			<span class="explanation">When the integral is active, the error is added to the integral every 30 seconds. The result is multiplied by Ki to give the integral part.</span>
			<input type="text" name="Ki" class="cc Ki">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">PID: Kd</span>
			<span class="explanation">The derivative of the beer temperature is multiplied by Kd to give the derivative part of the PID value.</span>
			<input type="text" name="Kd" class="cc Kd">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">PID: maximum</span>
			<span class="explanation">You can define the maximum difference between the beer temp setting and fridge temp setting here. The fridge setting will be clipped to this range.</span>
			<input type="text" name="pidMax" class="cc pidMax">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Integrator: maximum temp error &deg;<?php echo $tempFormat ?></span>
			<span class="explanation">The integral is only active when the temperature is close to the target temperature. This is the maximum error for which the integral is active..</span>
			<input type="text" name="iMaxErr" class="cc iMaxErr">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Temperature idle range top</span>
			<span class="explanation">When the fridge temperature is within this range, it won't heat or cool, regardless of other settings.</span>
			<input type="text" name="idleRangeH" class="cc idleRangeH">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Temperature idle range bottom</span>
			<span class="explanation">When the fridge temperature is within this range, it won't heat or cool, regardless of other settings.</span>
			<input type="text" name="idleRangeL" class="cc idleRangeL">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Heating target upper bound</span>
			<span class="explanation">When the overshoot lands under this value, the peak is within target range and the estimator is not adjusted.</span>
			<input type="text" name="heatTargetH" class="cc heatingTargetH">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Heating target lower bound</span>
			<span class="explanation">When the overshoot lands above this value, the peak is within target range and the estimator is not adjusted.</span>
			<input type="text" name="heatTargetL" class="cc heatingTargetL">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Cooling target upper bound</span>
			<span class="explanation">When the overshoot lands under this value, the peak is within target range and the estimator is not adjusted.</span>
			<input type="text" name="coolTargetH" class="cc coolingTargetH">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Cooling target lower bound</span>
			<span class="explanation">When the overshoot lands above this value, the peak is within target range and the estimator is not adjusted.</span>
			<input type="text" name="coolTargetL" class="cc coolingTargetL">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Maximum time in seconds for heating overshoot estimator</span>
			<span class="explanation">The time the fridge has been heating is used to estimate overshoot. This is the maximum time that is taken into account.</span>
			<input type="text" name="maxHeatTimeForEst" class="cc maxHeatTimeForEst">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Maximum time in seconds for cooling overshoot estimator</span>
			<span class="explanation">The time the fridge has been cooling is used to estimate overshoot. This is the maximum time that is taken into account.</span>
			<input type="text" name="maxCoolTimeForEst" class="cc maxCoolTimeForEst">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Beer fast filter delay time</span>
			<span class="explanation">The beer fast filter is used for display and data logging. More filtering give a smoother line, but also more delay.</span>
			<?php echoFilterSelect("beerFastFilt") ?>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Beer slow filter delay time</span>
			<span class="explanation">The beer slow filter is used for the control algorithm. The fridge temperature setting is calculated from this filter.
				Because a small difference in beer temperature causes a large adjustment in the fridge temperature, more smoothing is needed.</span>
			<?php echoFilterSelect("beerSlowFilt") ?>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Beer slope filter delay time</span>
			<span class="explanation">The slope is calculated every 30 seconds and fed to this filter. More filtering means a smoother fridge setting.</span>
			<?php echoSlopeFilterSelect("beerSlopeFilt") ?>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Fridge fast filter delay time</span>
			<span class="explanation">The fridge fast filter is used for on-off control, display and logging. It needs to have a small delay.</span>
			<?php echoFilterSelect("fridgeFastFilt") ?>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Fridge slow filter delay time</span>
			<span class="explanation">The fridge slow filter is used for peak detection to adjust the overshoot estimators. More smoothing is needed to prevent small fluctiations to be recognized as peaks.</span>
			<?php echoFilterSelect("fridgeSlowFilt") ?>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Fridge slope filter delay time</span>
			<span class="explanation">The fridge slope filter is not used in the current version.</span>
			<?php echoSlopeFilterSelect("fridgeSlopeFilt") ?>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Use light as heater</span>
			<span class="explanation">If this option is set to 'Yes' the light wil be used as a heater..</span>
			<?php echoYesNoSelect("lah") ?>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Trigger rotary encoder at every ...</span>
			<span class="explanation">When you feel like you have to turn your rotary encoder two steps for every trigger, set this to half step.</span>
			<?php echoRotarySelect("hs") ?>
			<button class="send-button">Send to Arduino</button>
		</div>
	</div>
</div>

<div id="device-config">
	<div class="console-box" id="device-console">
		<span></span>
	</div>
	<div class = "header ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">
		<span class='container-title'>Device List</span>
		<div class="refresh-options-container">
			<div class="refresh-option">
				<input type="checkbox" name="read-values" id="read-values"/><label for="read-values">Read values</label>
			</div>
		</div>
		<button class="refresh-device-list">Refresh device list</button>
	</div>
	<div class="device-list-container ui-widget-content ui-corner-all">
		<div class ="spinner-position"></div>
		<div class="device-list"></div>
	</div>
</div>

<div id="view-logs">
	<div id="log-buttons" style="clear:both">
		<button id="erase-logs">Erase logs</button>
		<button id="auto-refresh-logs">Enable auto refresh</button>
		<button id="refresh-logs">Refresh</button>
	</div>
	<h3>stderr:</h3>
	<div class="stderr console-box"></div>
	<h3>stdout:</h3>
	<div class="stdout console-box"></div>
</div>
