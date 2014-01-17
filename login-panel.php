<?php
/* Copyright 2013 BrewPi/Julien Mottin.
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

<?php
require_once ("./include/membersite_config.php");
?>

<div id='fg_membersite'>
  <form id='loginForm' action="login.php" method='post' accept-charset='UTF-8'>
    <fieldset >
      <legend>Login</legend>
      <div class='short_explanation'>* required fields</div>
      <div>
  	    <span class='error'><?php echo $fgmembersite -> GetErrorMessage(); ?></span></div>
        <div class='container'>
        <label for='username' >User name*:</label><br/>
        <input type='text' name='username' id='username' value='<?php echo $fgmembersite->SafeDisplay('username') ?>' maxlength="50" /><br/>
        <span id='login_username_errorloc' class='error'></span>
      </div>
      <div class='container'>
        <label for='password' >Password*:</label><br/>
        <input type='password' name='password' id='password' maxlength="50" /><br/>
        <span id='login_password_errorloc' class='error'></span>
      </div>
      <div class='container'>
        <input type='button' id='submit' name='Submit' value='Submit'/>
      </div>
    </fieldset>
  </form>
</div>