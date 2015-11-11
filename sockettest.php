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
<!DOCTYPE html >
<html>
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<title>BrewPi socket message test page</title>
		<script type="text/javascript" src="js/jquery-1.11.0.min.js"></script>

		<script type="text/javascript">
		$(document).ready(function(){
			$("button#send").click(function(){
				$.post('socketmessage.php', {messageType: String($("#messageType").val()), message: String($("#message").val())}, function(reply){
					$("span#reply").text(reply);
				});

			});
		});

		</script>
	</head>
	<body>
	<span>messageType:</span>
	<input id="messageType">
	<span>message:</span>
	<input id="message">
	<button id="send">Send</button>
	<br>
	<span>Reply:</span>
	<span id="reply"></span>
	</body>
</html>
