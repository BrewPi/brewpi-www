Modifying BrewPi config files
=============================
The defaults should work in most cases, if you run BrewPi on a Raspberry Pi and are happy with the default setup.
The config files for BrewPi are split in two: default configuration and user configuration.
The user config files overrule the default configuration. They are created on first use, or can be added manually.

The default config is version controlled with git, the user config files are ignored.


Editing the script config file
------------------------------

In the script's settings directory, the user config file is called `config.cfg <https://github.com/BrewPi/brewpi-script/blob/master/settings/config.cfg>`_.
By default, all settings are commented in this file. BrewPi first loads `defaults.cfg <https://github.com/BrewPi/brewpi-script/blob/master/settings/defaults.cfg>`_,
and overwrites the default settings with the user settings in `config.cfg`. Generally, the defaults will work.
If you change settings in the web interface, for example the beer name or interval, these settings will be written to ``config.cfg``.

If your Arduino is using a different serial port than /dev/ttyACM0, you will have add the setting to config.cfg.
The altport setting is used when the normal port cannot be found.

.. code-block:: text
    port = /dev/ttyACM0
    altport = /dev/ttyACM1


If you are not running BrewPi on a Raspberry Pi, but for instance on Windows, you will want to change a few of these parameters.
For my setup on Windows I use WAMP as a web server and run the python scripts in IntelliJ IDEA (ask me for a license key).

My config.cfg file for Windows has these settings:

.. code-block:: text

    scriptPath = c:\Users\Elco\Dropbox\BrewPi\git\brewpi-script\
    wwwPath = c:\wamp\www\brewpi\
    port = COM7
    arduinoHome = c:\arduino-1.0.4\
    avrdudeHome = C:\arduino-1.0.4\hardware\tools\avr\bin\
    avrsizeHome = C:\arduino-1.0.4\hardware\tools\avr\bin\
    avrConf = C:\arduino-1.0.4\hardware\tools\avr\etc\avrdude.conf

Editing the web interface config file
-------------------------------------
In web interface, the settings in `config.cfg <https://github.com/BrewPi/brewpi-script/blob/master/settings/config.cfg>`_
are overruled by config_user.php, if it exists. The only setting for the web interface is the location of the scripts directory.
An `example file for config_user.php <https://github.com/BrewPi/brewpi-www/blob/master/config_user.php.example>`_ is included in the repository.
Copy this example file to config_user.php and make edits to the copy.
