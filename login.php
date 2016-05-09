<?php
/* Copyright 2016 Joel McBreen.

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

require_once('auth.php');

if(isAuthenticated()) {
    header("Location: index.php");
    exit;
}

if(isset($_POST['btn-login'])) {
    login($_POST['username'], $_POST['password']);
}

if(isset($_GET["failed"])){
    echo 'Invalid username or password';
}

if(isset($_GET["stand-down"])){
    echo 'You failed to log in too many times';
}

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>BrewPi - Login</title>
        <link type="text/css" href="css/redmond/jquery-ui-1.10.3.custom.css" rel="stylesheet" />
        <link type="text/css" href="css/style.css" rel="stylesheet"/>
    </head>
    <body>
        <div id="top-bar" class="ui-widget ui-widget-header ui-corner-all">
            <?php
                include 'lcd.php';
            ?>
            <div id="logo-container">
                <a href="index.php"><img src="brewpi_logo.png"></a>
            </div>
        </div>
        <center>
            <div id="login-form">
                <form action="login.php" method="post">
                    <table align="center" width="30%" border="0">
                        <tr><td><input type="text" name="username" placeholder="Your Username" required autofocus /></td></tr>
                        <tr><td><input type="password" name="password" placeholder="Your Password" required /></td></tr>
                        <tr><td><button type="submit" name="btn-login">Login</button></td></tr>
                    </table>
                </form>
            </div>
        </center>
        
        <?php
            include 'base-scripts.php';
        ?>
		<script type="text/javascript" src="js/lcd.js"></script>
    </body>
</html>