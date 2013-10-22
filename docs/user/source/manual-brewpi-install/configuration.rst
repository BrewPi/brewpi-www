Configuring your BrewPi install
===============================
The defaults should work in most cases, if you run BrewPi on a Raspberry Pi and are happy with the default setup, but you do have to set up the CRON job.

Editing the config file
-----------------------

In the script's settings directory, there is a file called `config.cfg <https://github.com/BrewPi/brewpi-script/blob/master/settings/config.cfg>`_.
By default, all settings are commented in this file. BrewPi first loads `defaults.cfg <https://github.com/BrewPi/brewpi-script/blob/master/settings/defaults.cfg>`_, and overwrites the default settings with the user settings in `config.cfg`. Generally, the defaults will work. If you change settings in the web interface, for example the beer name or interval, these settings will be written to ``config.cfg``.

In this file you will also find the key for your temperature profile. This key now points to the Sample Profile, but you will want to change it to your own profile so you can edit it.
This is done most easily through the web interface, so we will do that later when the script is running.

If you are not running BrewPi on a Raspberry Pi, but for instance on Windows, you will want to change a few of these parameters. For my setup on Windows I use WAMP as a web server and run the python scripts in IntelliJ IDEA (ask me for a license key).

My config.cfg file for Windows has these settings:

.. code-block:: text

    scriptPath = c:\Users\Elco\Dropbox\BrewPi\git\brewpi-script\
    wwwPath = c:\wamp\www\brewpi\
    port = COM7
    arduinoHome = c:\arduino-1.0.4\
    avrdudeHome = C:\arduino-1.0.4\hardware\tools\avr\bin\
    avrsizeHome = C:\arduino-1.0.4\hardware\tools\avr\bin\
    avrConf = C:\arduino-1.0.4\hardware\tools\avr\etc\avrdude.conf


Setting up a CRON job to start the script
-----------------------------------------
Since version 0.2, managing running brewpi processes integrated into the script: when BrewPi is started with the --dontrunfile option, it will check whether the file 'do_not_run_brewpi' exists in the web directory. If it exists, the script will exit. With this option, CRON can just start the script every minute. When a script is already running, the script exits immediately.

To have CRON start the script every minute, we will have to add it to the crontab of the brewpi user. Editing a crontab is done with 'crontab -e', but we will have to run that command as the brewpi user with 'sudo -u brewpi

.. code-block:: bash

    sudo -u brewpi crontab -e

Now add this to the end of the crontab:

.. code-block:: bash

     * * * * * python -u /home/brewpi/brewpi.py --dontrunfile 1>/home/brewpi/logs/stdout.txt 2>>/home/brewpi/logs/stderr.txt &


What this line says is the following:

+----------------------------------------------------+--------------------------------------------------------------------------------------+
| Piece of command                                   | What it does                                                                         |
+====================================================+======================================================================================+
| ``* * * * *``                                      | | Every minute of every hour of every day of every month of every year               |
+----------------------------------------------------+--------------------------------------------------------------------------------------+
| ``python -u /home/brewpi/brewpi.py --dontrunfile`` | | Start the brewpi.py script with unbuffered output ``-u``, so log files are written |
|                                                    | | immediately. Use the ``--dontrunfile`` option to check the file at startup.        |
+----------------------------------------------------+--------------------------------------------------------------------------------------+
| ``1>/home/brewpi/logs/stdout.txt``                 | | Write ``>`` stdout of the process ``1`` to ``/home/brewpi/stdout.txt``             |
+----------------------------------------------------+--------------------------------------------------------------------------------------+
| ``2>>/home/brewpi/logs/stderr.txt &``              | | Append ``>>`` stderr of the process ``2`` to ``/home/brewpi/stderr.txt`` and       |
|                                                    | | fork the command and run it in background ``&``.                                   |
|                                                    | | Without ``&`` at the end, CRON would wait for an answer from the script.           |
+----------------------------------------------------+--------------------------------------------------------------------------------------+

After adding the line to the brewpi user's crontab, close the editor. The new crontab will be automatically installed and start running. This will start the BrewPi script. From now on, it will be automatically started, unless you have stopped it with the 'Stop script' button in the web interface.
