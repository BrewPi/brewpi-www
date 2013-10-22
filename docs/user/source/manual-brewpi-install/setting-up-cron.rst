Setting up a CRON job to start the script
-----------------------------------------
Since version 0.2, managing running brewpi processes integrated into the script:
when BrewPi is started with the --dontrunfile option, it will check whether the file 'do_not_run_brewpi' exists in the web directory.
If it exists, the script will exit. With this option, CRON can just start the script every minute. When a script is already running, the script exits immediately.
The script will also check for conflicting instances of BrewPi.py at startup.

To have a cron job check BrewPi every minute, we will add a script to /etc/cron.d
This script is `included with the BrewPi script repository <https://github.com/BrewPi/brewpi-script/blob/develop/utils/brewpi.cron>`_.

If you still have a line for BrewPi in the brewpi user's crontab (as used in 0.2), you will have to remove it.

The commands in this document can be automatically performed using the updateCron.sh script in your script/utils direcotry:

.. code-block:: bash

     sudo /home/brewpi/utils/updateCron.sh

To set up the cron job manually, create the file /etc/cron.d/brewpi and add the following line:

.. code-block:: bash

     * * * * * brewpi python /home/brewpi/brewpi.py --checkstartuponly --dontrunfile; [ $? != 0 ] && python -u /home/brewpi/brewpi.py 1>/home/brewpi/logs/stdout.txt 2>>/home/brewpi/logs/stderr.txt &


What this line says is the following:

+--------------------------------------------------------------------+--------------------------------------------------------------------------------------+
| Piece of command                                                   | What it does                                                                         |
+====================================================================+======================================================================================+
| ``* * * * *``                                                      | | Every minute of every hour of every day of every month of every year               |
+--------------------------------------------------------------------+--------------------------------------------------------------------------------------+
| ``python /home/brewpi/brewpi.py --checkstartuponly --dontrunfile`` | | Start brewpi.py to check the dontrunfile (and conflicting processes).              |
|                                                                    | | Only do the startup checks and return 1 (do start) or 0 (do not start).            |
|                                                                    | | This lets us do output redirection on the second call of brewpi.py in this job     |
+--------------------------------------------------------------------+--------------------------------------------------------------------------------------+
| ``[ $? != 0 ] && python -u /home/brewpi/brewpi.py``                | | If the previous command didn't return 0, start brewpi.py with unbuffered output.   |
|                                                                    | | This ensures the log files are written while the script is running.                |
+--------------------------------------------------------------------+--------------------------------------------------------------------------------------+
| ``1>/home/brewpi/logs/stdout.txt``                                 | | Write ``>`` stdout of the process ``1`` to ``/home/brewpi/stdout.txt``             |
+--------------------------------------------------------------------+--------------------------------------------------------------------------------------+
| ``2>>/home/brewpi/logs/stderr.txt &``                              | | Append ``>>`` stderr of the process ``2`` to ``/home/brewpi/stderr.txt`` and       |
|                                                                    | | fork the command and run it in background ``&``.                                   |
|                                                                    | | Without ``&`` at the end, CRON would wait for an answer from the script.           |
+--------------------------------------------------------------------+--------------------------------------------------------------------------------------+

Restart CRON after adding/editing the file:

.. code-block:: bash

    sudo /etc/init.d/cron restart||die
