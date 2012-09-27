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
	<li><a href="#settings"><span class="setting-name">Settings</span></a></li>
	<li><a href="logs.php"><span>Log files</span></a></li>
	<li><a href="previous_beers.php"><span>Previous Beers</span></a></li>
	<li><a href="#control-algorithm"><span>Control Algorithm</span></a></li>
	<li><a href="#advanced-settings"><span>Advanced Settings</span></a></li>
	<li><a href="#reprogram-arduino"><span>Reprogram Arduino</span></a></li>
	<!--kinda dirty to have buttons in the ul, but the ul is styled as a nice header by jQuery UI -->
	<button class="script-status"</button>
</ul>
<div id="reprogram-arduino">
	<div class="script-warning ui-widget-content ui-corner-all" style="padding:5px;">
		<p>Here you can upload a HEX file which will be uploaded to the Arduino by the Python script.
			The script will automatically restart itself after programming.
			Just hit the back button on your browser to continue running BrewPi.</p>
		<div style="padding: 15px 0;">
			<form action="program_arduino.php" method="post" enctype="multipart/form-data">
				<label for="file">Hex file:</label>
				<input type="file" name="file" id="file" /> <!-- add max file size?-->
				<label for="boardType"> Board type:</label>
				<select name="boardType">
					<option value="leonardo">Leonardo</option>
					<option value="uno">Uno</option>
					<option value="atmega328">ATmega328 based</option>
					<option value="diecimila">Atmega168 based</option>
					<option value="mega2560">Mega 2560</option>
					<option value="mega">Mega 1280</option>
				</select>
				<label for="eraseEEPROM"> Reset settings (clear EEPROM)</label>
				<input type="radio" name="eraseEEPROM" value="true" checked>Yes
				<input type="radio" name="eraseEEPROM" value="false">No
				<input type="submit" name="Program" value="Program">
			</form>
		</div>
		<p>Note: the EEPROM is only preserved when the 'Preserve EEPROM' fuse is set!</p>
	</div>
</div>
<div id="settings">
	<div class="settings-container ui-widget-content ui-corner-all">
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
			<span class="setting-name">Start new beer:</span>
			<input id="beer-name" value="Enter new or existing name.." size=30 type="text">
			<button class="apply-beer-name apply-button">Apply</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Google Docs key for profile:</span>
			<input id="profile-key" value="<?php echo $profileKey ?>" size=30 type="text">
			<button class="apply-profile-key apply-button">Apply</button>
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
	<div class="algorithm-container ui-helper-reset ui-helper-clearfix ui-widget-content ui-corner-all">
		<div class="help-panel">
			<p>
				The orange values are control variables: they change as the algorithm runs.
				Kp slowly transition between KpCool and KpHeat, which are constant. Same for Kd.
				The red value are control settings, the blue one is a constant.
				The beer temperature is controlled by setting the fridge temperature with PID.
				You can set the parameters on the 'advanced settings' tab.
			</p>
		</div>
		<div class="equation">
			<div class="cv beerDiff"><span class="name">Beer temp. error</span><span class="val"></span></div>
			<span class="operator multiply">*</span>
			<div class="cv Kp"><span class="name">Kp</span><span class="val"></span></div>
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
			<div class="cv Kd"><span class="name">Kd</span><span class="val"></span></div>
			<span class="operator equals">=</span>
			<div class="cv d"><span class="name">D</span><span class="val"></span></div>
		</div>
		<div class="sum-line"><div class="line"></div><span class="operator plus">+</span></div>
		<div class="equation">
			<div class="cs beerSetting"><span class="name">Beer Setting</span><span class="val"></span></div>
			<span class="operator plus">+</span>
			<div class="cv pid-result"><span class="name">P + I + D</span><span class="val"></span></div>
			<span class="operator equals">=</span>
			<div class="cs fridgeSetting"><span class="name">FridgeSetting</span><span class="val"></span></div>
		</div>
	</div>
	<div class = "header ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">
		<span class='container-title'>Peak detection for predictive ON/OFF control</span>
		<button class="cs update-from-arduino">Update control settings</button>
		<button class="cv update-from-arduino">Update control variables</button>
		<button class="cc update-from-arduino">Update control constants</button>
	</div>
	<div class="algorithm-container ui-helper-reset ui-helper-clearfix ui-widget-content ui-corner-all">
		<div class="help-panel">
			<p>
				The heater and cooler are controlled by a predictive on-off algorithm.
				BrewPi estimates the overshoot that would happen when it would go to IDLE. When that lands on the target temperature, it goes to IDLE.
				The overshoot is estimated as time active / 3600 * estimator.
				BrewPi detects the actual peaks and compares them to the prediction to automatically adjusts the estimators.
				You can change them mannually in 'advanced settings' when they are far off.
			</p>
		</div>
		<div class="on-off-parameters">
			<div class="cv estimatedPeak"><span class="name">Estimated peak</span><span class="val"></span></div>
			<div class="cv negPeak"><span class="name">Last detected negative peak</span><span class="val"></span></div>
			<div class="cv negPeakSetting"><span class="name">Last target for negative peak</span><span class="val"></span></div>
			<div class="cv posPeak"><span class="name">Last detected positive peak</span><span class="val"></span></div>
			<div class="cv posPeakSetting"><span class="name">Last target for positive peak</span><span class="val"></span></div>
			<div class="cs coolEstimator"><span class="name">Cooling overshoot estimator</span><span class="val"></span></div>
			<div class="cs heatEstimator"><span class="name">Heating overshoot estimator</span><span class="val"></span></div>
		</div>
	</div>
</div>
<div id="advanced-settings">
	<div id="control-settings-container" class="ui-widget-content ui-corner-all">
		<div class = "header ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">
			<span class='container-title'>Control settings</span>
			<button class="cs load-defaults">Reload defaults</button>
			<button class="cs receive-from-script">Receive from script</button>
			<button class="cs update-from-arduino">Update from Arduino</button>
		</div>
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
			<input type="text" name="beerSetting" class="cs beerSetting">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Fridge Temperature Setting</span>
			<span class="explanation">Automatically adjust when in profile/beer constant mode. Use the control panel to adjust.</span>
			<input type="text" name="fridgeSetting" class="cs fridgeSetting">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Cooling overshoot estimator</span>
			<span class="explanation">This is a self learning estimator for the overshoot when turning the cooler off.
			It is adjusted automatically, but you can set adjust it manually here. This does not stop further automatic adjustment.</span>
			<input type="text" name="coolEstimator" class="cs coolEstimator">
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Heating overshoot estimator</span>
			<span class="explanation">This is a self learning estimator for the overshoot when turning the heater off.
			It is adjusted automatically, but you can set adjust it manually here. This does not stop further automatic adjustment.</span>
			<input type="text" name="heatEstimator" class="cs heatEstimator">
			<button class="send-button">Send to Arduino</button>
		</div>
	</div>
	<div id="control-constants-container" class="ui-widget-content ui-corner-all">
		<div class = "header ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">
			<span class='container-title'>Control constants</span>
			<button class="cc load-defaults">Reload defaults</button>
			<button class="cc receive-from-script">Receive from script</button>
			<button class="cc update-from-arduino">Update from Arduino</button>
		</div>
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
			<span class="setting-name">Temperature setting minimum</span><input type="text" name="tempSettingMin" class="cc tempSettingMin">
			<span class="explanation">The fridge and beer temperatures cannot go below this value.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Temperature setting maximum</span><input type="text" name="tempSettingMax" class="cc tempSettingMax">
			<span class="explanation">The fridge and beer temperatures cannot go above this value.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<span class="section-explanation">The fridge temperature is controlled with PID. The fridge setting = beer setting + PID.
			The proportional part is linear with the temperature error.
			The integral part slowly increases when the error stays present, this prevents steady state errors.
			The derivative part is in the opposite direction to the proportional part. This prevents overshoot: it lowers the PID value when there's 'momentum' in the right direction.
		</span>
		<div class="setting-container">
			<span class="setting-name">PID: KpHeat</span><input type="text" name="KpHeat" class="cc KpHeat">
			<span class="explanation">The beer temperature error is multiplied by KpHeat to give the proportional part when heating.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">PID: KpCool</span><input type="text" name="KpCool" class="cc KpCool">
			<span class="explanation">The beer temperature error is multiplied by KpCool to give the proportional part when cooling.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">PID: Ki</span><input type="text" name="Ki" class="cc Ki">
			<span class="explanation">When the integral is active, the error is added to the integral every 30 seconds. The result is multiplied by Ki to give the integral part.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">PID: KdCool</span><input type="text" name="KdCool" class="cc KdCool">
			<span class="explanation">The derivative of the beer temperature is multiplied by KdCool to give the derivative part when cooling.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">PID: KdHeat</span><input type="text" name="KdHeat" class="cc KdHeat">
			<span class="explanation">The derivative of the beer temperature is multiplied by KdHeat to give the derivative part when heating.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Integrator: maximum temp error &deg;<?php echo $tempFormat ?></span><input type="text" name="iMaxError" class="cc iMaxError">
			<span class="explanation">The integral is only active when the temperature is close to the target temperature. This is the maximum error for which the integral is active..</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Integrator: maximum temp slope &deg;<?php echo $tempFormat ?>/h</span><input type="text" name="iMaxSlope" class="cc iMaxSlope">
			<span class="explanation">The integral is only active when the slope is almost horizontal, because it's only purpose is to remove steady state errors. This is the upper bound for the slope in degrees/hour.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Integrator: minimum temp slope &deg;<?php echo $tempFormat ?>/h</span><input type="text" name="iMinSlope" class="cc iMinSlope">
			<span class="explanation">This is the lower bound for the slope in degrees/hour.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Temperature idle range top</span><input type="text" name="idleRangeHigh" class="cc idleRangeHigh">
			<span class="explanation">When the fridge temperature is within this range, it won't heat or cool, regardless of other settings.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Temperature idle range bottom</span><input type="text" name="idleRangeLow" class="cc idleRangeLow">
			<span class="explanation">When the fridge temperature is within this range, it won't heat or cool, regardless of other settings.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Heating target upper bound</span><input type="text" name="heatingTargetUpper" class="cc heatingTargetUpper">
			<span class="explanation">When the overshoot lands under this value, the peak is within target range and the estimator is not adjusted.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Heating target lower bound</span><input type="text" name="heatingTargetLower" class="cc heatingTargetLower">
			<span class="explanation">When the overshoot lands above this value, the peak is within target range and the estimator is not adjusted.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Cooling target upper bound</span><input type="text" name="coolingTargetUpper" class="cc coolingTargetUpper">
			<span class="explanation">When the overshoot lands under this value, the peak is within target range and the estimator is not adjusted.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Cooling target lower bound</span><input type="text" name="coolingTargetLower" class="cc coolingTargetLower">
			<span class="explanation">When the overshoot lands above this value, the peak is within target range and the estimator is not adjusted.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Maximum time in seconds for heating overshoot estimator</span><input type="text" name="maxHeatTimeForEstimate" class="cc maxHeatTimeForEstimate">
			<span class="explanation">The time the fridge has been heating is used to estimate overshoot. This is the maximum time that is taken into account.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Maximum time in seconds for cooling overshoot estimator</span><input type="text" name="maxCoolTimeForEstimate" class="cc maxCoolTimeForEstimate">
			<span class="explanation">The time the fridge has been cooling is used to estimate overshoot. This is the maximum time that is taken into account.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Beer fast filter settling time</span> <?php echoFilterSelect("beerFastFilter") ?>
			<span class="explanation">The beer fast filter is used for display and data logging. More filtering give a smoother line, but also more delay.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Beer slow filter settling time</span> <?php echoFilterSelect("beerSlowFilter") ?>
			<span class="explanation">The beer slow filter is used for the control algorithm. The fridge temperature setting is calculated from this filter.
				Because a small difference in beer temperature causes a large adjustment in the fridge temperature, more smoothing is needed.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Beer slope filter settling time</span> <?php echoSlopeFilterSelect("beerSlopeFilter") ?>
			<span class="explanation">The slope is calculated every 30 seconds and fed to this filter. More filtering means a smoother fridge setting.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Fridge fast filter settling time</span> <?php echoFilterSelect("fridgeFastFilter") ?>
			<span class="explanation">The fridge fast filter is used for on-off control, display and logging. It needs to have a small delay.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Fridge slow filter settling time</span> <?php echoFilterSelect("fridgeSlowFilter") ?>
			<span class="explanation">The fridge slow filter is used for peak detection to adjust the overshoot estimators. More smoothing is needed to prevent small fluctiations to be recognized as peaks.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
		<div class="setting-container">
			<span class="setting-name">Fridge slope filter settling time</span> <?php echoSlopeFilterSelect("fridgeSlopeFilter") ?>
			<span class="explanation">The fridge slope filter is not used in the current version.</span>
			<button class="send-button">Send to Arduino</button>
		</div>
	</div>
</div>

<?php
function echoFilterSelect($filterName){
	echo "<select name=" . $filterName . " class=\"cc " . $filterName . "\">";
	echo "<option value=1537>  25 seconds</option>"; // x0601
	echo "<option value=2050>  50 seconds</option>"; // x0802
	echo "<option value=2563> 100 seconds</option>"; // 0x0A03
	echo "<option value=3076> 200 seconds</option>"; // 0x0C04
	echo "<option value=3589> 400 seconds</option>"; // 0x0E05
	echo "<option value=4102> 800 seconds</option>"; // 0x1008
	echo "</select>";
}

# slope filters are updated every 30 seconds, so have different settling time
function echoSlopeFilterSelect($filterName){
	echo "<select name=" . $filterName . " class=\"cc " . $filterName . "\">";
	echo "<option value=1537>  12.5 minutes</option>"; // x0601
	echo "<option value=2050>  25 minutes</option>"; // x0802
	echo "<option value=2563>  50 minutes</option>"; // 0x0A03
	echo "<option value=3076> 100 minutes</option>"; // 0x0C04
	echo "<option value=3589> 200 minutes</option>"; // 0x0E05
	echo "<option value=4102> 400 minutes</option>"; // 0x1008
	echo "</select>";
}
?>
