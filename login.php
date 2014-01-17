<?php
require_once("./include/membersite_config.php");
$fgmembersite->Login();
if ($fgmembersite->CheckLogin()) {
  $fgmembersite->RedirectToURL("./");
}
else {
	echo 'FAILURE';
}
?>
