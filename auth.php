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
session_start();

require_once('configuration.php');

function isValidUser($user, $password) {
    
    if ($user == "admin"
        && $password == getConfig("adminPassword", "admin")) {
        return true;
    }
    
    return false;
}


function loginFailed() {
    if (!isset($_SESSION["attempts"])) {
        $_SESSION["attempts"] = 1;
    }
    else {
        $_SESSION["attempts"] = $_SESSION["attempts"] + 1;
    }
    
    if ($_SESSION["attempts"] >= getConfig("maxLoginAttempts", 3)) {
       $_SESSION["standDownExpiry"] = time() + getConfig("standDownSeconds", 30);
        header("Location: login.php?stand-down");
        exit;
    }
        
    header("Location: login.php?failed");
    exit;
}

function login($user, $password) {
    
    if (isset($_SESSION["standDownExpiry"]) && (time() > $_SESSION["standDownExpiry"])) {
        $_SESSION["attempts"] = 0;
    }
    
    if (isset($_SESSION["attempts"]) && ($_SESSION["attempts"] >= getConfig("maxLoginAttempts", 3))) {
        loginFailed();
    }
    
    $username = $_POST["username"];
    $password = $_POST["password"];

    if (!isValidUser($user, $password)) {
        loginFailed();
    }

    $_SESSION['user'] = $user;
    header("Location: index.php");
    exit;
}

function logout() {
    session_unset();
    session_write_close();
    session_destroy();
    header("Location: index.php");
}

function isAuthenticated(){
    return isset($_SESSION['user']);
}

function currentUser(){
    if (!isAuthenticated()) {
        return "";
    }
    return $_SESSION['user'];
}

function assertAuthenticated(){
    if (!isAuthenticated()) {
        header('WWW-Authenticate: Basic realm="My Realm"');
        header('HTTP/1.0 401 Unauthorized');
        echo 'Authentication denied';
        exit;
    }
}

?>