<?PHP
require_once("./include/fg_membersite.php");

$fgmembersite = new FGMembersite();

//Provide your site name here
$fgmembersite->SetWebsiteName('brewpi');

//Provide the email address where you want to get notifications
$fgmembersite->SetAdminEmail('julien@gueydan.eu');

//Provide your database login details here:
//hostname, user name, password, database name and table name
//note that the script will create the table (for example, fgusers in this case)
//by itself on submitting register.php for the first time
$fgmembersite->InitDB(/*hostname*/'localhost',
                      /*username*/'brewpi',
                      /*password*/'3sUurPWsLyS8Wpse',
                      /*database name*/'brewpi',
                      /*table name*/'fgusers');

//For better security. Get a random string from this link: http://tinyurl.com/randstr
// and put it here
$fgmembersite->SetRandomKey('7Z3Sqt9Gd276TA6FPaht0');

?>

