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

class LockOutDetails {
    public $failedAttempts = 0;
    public $standDownExpiry = 0;
    
    public static function addFailure() {
        
        $instance = LockOutDetails::load();
        $instance->failedAttempts = $instance->failedAttempts + 1;
        
        $lockedOut = false;
        if ($instance->failedAttempts >= getConfig("maxLoginAttempts", 3)) {
            $instance->standDownExpiry = time() + getConfig("standDownSeconds", 30);
            $instance->failedAttempts = 0;
            $lockedOut = true;
        }
        
        $instance->save();
        return $lockedOut;
    }
    
    public static function isLockedOut() {
        return (LockOutDetails::load()->standDownExpiry) > time();
    }
    
    public static function reset() {
        if (file_exists("data/lockoutdetails.data")) {
            unlink("data/lockoutdetails.data");
        }
    }
    
    function save() {
        $s = serialize($this);
        $fp = fopen("data/lockoutdetails.data", "w");
        fwrite($fp, $s);
        fclose($fp);
    }
    
    public static function load() {
        if (!file_exists("data/lockoutdetails.data")) {
            return new LockOutDetails();
        }
        $s = implode("", @file("data/lockoutdetails.data"));
        return unserialize($s);
    }
}

function isValidUser($user, $password) {
    
    if ($user == getConfig("adminUsername", "admin")
        && $password == getConfig("adminPassword", "admin")) {
        return true;
    }
    
    return false;
}

function loginFailed() {
    if (LockOutDetails::addFailure()) {
        stoodDown();
        exit;
    }
    $_SESSION['failed-login'] = 'true';
    header("Location: index.php");
    exit;
}

function stoodDown() {
    $_SESSION['locked-out'] = 'true';
    header("Location: index.php");
    exit;
}

function login($user, $password) {
    
    if (LockOutDetails::isLockedOut()) {
        stoodDown();
    }
    
    $username = $_POST["username"];
    $password = $_POST["password"];

    if (!isValidUser($user, $password)) {
        loginFailed();
    }

    unset($_SESSION['failed-login']);
    unset($_SESSION['locked-out']);
    LockOutDetails::reset();
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

function requireLogin() {
    return getConfig("requireLogin", true);
}

function isAuthenticated(){
    if (!requireLogin()) {
        return true;
    }
    return isset($_SESSION['user']);
}

function currentUser(){
    if (!isAuthenticated() || !requireLogin()) {
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