/* Copyright 2012 BrewPi/Julien Mottin.
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

$(document).ready(function(){
    "use strict";

    //Maintenance Panel
	$('#login-panel')
	.dialog({
		autoOpen: false,
		title: 'Login Panel',
		height: 210,
		width: 300
	}).tabs();    

    // unhide after loading
    $("#login-panel").css("visibility", "visible");
    
    $("button#login").button({	icons: {primary: "ui-icon-newwin" } }).unbind('click').click(function(){
        $("#login-panel").dialog("open");
    });
    
    $("#submit").click(function() {
      // get all the inputs into an array.
      var $inputs = $('#loginForm :input');

      // not sure if you wanted this, but I thought I'd add it.
      // get an associative array of just the values.
      var values = {};
      $inputs.each(function() {
        values[this.name] = $(this).val();
      });
      
      loginToDB(values['username'],values['password']);
      
    });

});

function loginToDBCallback(data,status){
  $("#login-panel").dialog("close");
  if ('FAILURE'==data) {
  	alert("Login failed!");
  }
  else {
  	location.reload();	
  }  
}

function loginToDB(userName, passWord) {
	$.post("login.php",{username:userName,password:passWord,submitted:1},loginToDBCallback);
}
