Programming your Arduino with BrewPi
====================================
Uploading a new hes file to your Arduino can be done straight from the BrewPi web interface.
The serial port is read from the config file (``/home/brewpi/settings/config.cfg``), so make sure the settings are correct.
The default should normally work (``/dev/ttyACM0``), but if your script fails to start because the serial port is not found, run this to see the candidates:

.. code-block:: bash

    ls /dev/ttyA*

It is definitely not ``ttyAMA0``, that is the internal serial port.

Uploading a new HEX file to your Arduino
----------------------------------------

To program your Arduino from the web interface, take the following steps:

#.  Make sure the BrewPi script is running. If it is not started by CRON, start it with:

    .. code-block:: bash

        sudo -u brewpi python /home/brewpi/brewpi.py

#.  Open the maintenance panel and go to the `Reprogram Arduino` tab.

#.  Download the HEX file appropriate for your setup from http://dl.brewpi.com/brewpi-avr/stable. You can also compile your own hex file with Atmel Studio. Make sure you have the right file for your Arduino type (UNO or Leonardo) and the right shield revision. RevA has white silk screen, RevC has black silkscreen. Click the `Browse` button and select your file.

#.  The program script can automatically restore your settings and devices after upgrading. If you are uploading to a virgin Arduino, just answer NO to both.

#.  Next, just click the program button. If your script was started by CRON, the output will appear in the black box.

#.  The BrewPi script will automatically restart after programming and report which version of BrewPi it has found on the Arduino.


Troubleshooting
---------------
* If you're prompted with an error: "cannot move uploaded file" rerun the fix permissions script in ``sudo sh /home/brewpi/fixPermissions.sh``.
* If saving devices in the device manager does not work, your EEPROM was probably not reset properly. Try reprogramming without settings and devices restore.
* Check whether it is not a hardware problem by programming your Arduino using the Arduino IDE. Just open the `blink` example and click `upload`.


Programming without the web interface
-------------------------------------
If you are having trouble programming through the web interface, you can try running ``programArduinoFirstTime.py``, which is located in your brewpi script directory.
First edit it to have the correct settings. Then run it with:

    .. code-block:: bash

        sudo python /home/brewpi/programArduinoFirstTime.py

Please let us know if you had to resort to this option, it should not be necessary.
