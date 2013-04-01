<?php

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
			echo "Not connected";
			if (getConfig('debug', false))
				echo socket_strerror(socket_last_error($sock));
		}
	}
	return $sock;
}


?>