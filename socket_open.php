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

require_once('configuration.php');

function open_socket()
{
    $isWindows = defined('PHP_WINDOWS_VERSION_MAJOR');
    $useInetSocket = getConfig("useInetSocket", $isWindows);
    if ($useInetSocket)
        $sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
    else
        $sock = socket_create(AF_UNIX, SOCK_STREAM, 0);

    if (!($sock === false))
    {
        if(
            ((!$useInetSocket) && socket_connect($sock, "$GLOBALS[scriptPath]/BEERSOCKET"))
            || (($useInetSocket) && socket_connect($sock, getConfig("scriptAddress", "localhost"), getConfig("scriptPort",6332))))
        {
            socket_set_option($sock, SOL_SOCKET, SO_RCVTIMEO, array('sec' => 15, 'usec' => 0));
        }
        else{
            socket_close($sock);
            if (getConfig('debug', false))
				echo "Socket connection failed: " . socket_strerror(socket_last_error($sock));
		}
	}
	return $sock;
}