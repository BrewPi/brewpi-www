
Basic configuration of your Raspberry Pi
========================================
This step by step guide will help you to set everything up on your Raspberry Pi and Arduino.

Installing Linux on your Raspberry Pi
-------------------------------------
You can download an optimized Debian image for Raspberry Pi from their download page.

#. Go to the `Raspberry Pi download page <http://www.raspberrypi.org/downloads>`_
#. Download the latest Raspbian Wheezy image by clicking the `Direct Download` link for the zip file.
#. On the following download confirmation page, click on the Direct Link if you are not redirected.
#. Wait until you download is finished.
#. (Optional) Verify the image following the checksum instructions link on the confirmation page.

A list of recommended SD cards can be found at http://elinux.org/RPi_SD_cards
The default login credentials for the image are username ``pi`` and password ``raspberry``.

Putting the image on your SD card (Windows)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can use `Win32DiskImager <http://www.softpedia.com/get/CD-DVD-Tools/Data-CD-DVD-Burning/Win32-Disk-Imager.shtml>`_ to write the image to your memory card with a card reader. If you have an old image on your card and cannot remove the partition with Windows, `SD Formatter <https://www.sdcard.org/downloads/formatter_3/>`_ can help you to format the SD card before writing the image.

Putting the image on your SD card (Mac)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#. Prepare the SD card for Linux distribution loading
    #. Insert the SD card into the slot or reader.
    #. Open Disk Utility.
    #. Click on the SD card in the disk list (not its partition, which is indented below it).
    #. Click on the Erase tab.
    #. Select ExFAT in the Format selection list.
    #. Type in a desired disk name (e.g. BREWPI).
    #. Click the Erase... button (the disk will be partitioned automatically).
    #. Click the Erase button in the confirmation dialog box.
    #. Close Disk Utility.

#. Determine the SD card image identifier
    #. Right-click on the SD card image (desktop icon), and select Eject "BREWPI".
    #. Open Terminal.
    #. Execute the following command to produce a list of disks. ``df -h``
    #. Make note of any existing disks identified similar to ``/dev/disk?s?``.
    #. Pull out the SD card, and push it back into the slot.
    #. Execute the following command, and make note of the added SD card identifier. ``df -h``

#. Load the Linux distribution onto the SD card (not the partition)
    #. Execute the following Terminal command with the SD card identifier to unmount the SD card. Do not unmount from Finder. ``sudo diskutil unmount /dev/disk?s?``
    #. Execute the following command with the location of the Linux distribution image to load the Linux distribution onto the SD card (leaving off the s? portion of the SD card identifier) ``sudo dd bs=1m if=~/downloads/... of=/dev/rdisk?``
    #. When complete (it will take a while), pull out the SD card, and push it back into the slot to mount it.
    #. Double click on the SD card image to confirm the loaded Linux distribution.
    #. Right-click on the SD card image (desktop icon), and select Eject "BREWPI".
    #. Pull out the SD card.


Configuring your system
-----------------------

When you have put the image on the card, plug in a keyboard, network cable and a monitor and use the on screen menu to configure the basic settings. If the menu doesn't come up automatically, type:

.. code-block:: bash

    sudo raspi-config


Updating programs
-----------------

Keep your programs up to date with these commands:

.. code-block:: bash

    sudo apt-get update
    sudo apt-get upgrade


Updating firmware
-----------------

Make sure you also have the latest firmware version, and stay up to date using `rpi-update by Hexxeh <https://github.com/Hexxeh/rpi-update>`_.
Firmware updates will often fix instability issues, so make sure you run one. USB used to be unstable on the pi, but the latest firmware fixed this.


*For Mac-specific instructions, see `Raspberry Pi SD Card Setup via Mac <http://wiki.brewpi.com/index.php/Raspberry_Pi_SD_Card_Setup_via_Mac>`_.*

If you enable SSH, this should be the last time you need a keyboard and monitor, but it might be wise to leave them plugged in when you are setting up WiFi. Use every menu option to set up your Pi properly. Especially don't forget to expand your partition, or you will run out of space during the setup! Trust me, I know.. Expanding the partition takes a while and there is no progress bar. It will take up to 20 minutes, but as long as your status LED is green, it is still working. Go grab a beer and `RDWHAHB <http://www.homebrewtalk.com/wiki/index.php/RDWHAHB>`_.

Setting up WiFi
---------------

I am using an Edimax EW-7811un WiFi dongle. The latest image has built in support for this dongle. I can highly recommend this dongle.
`This setup script <http://www.raspberrypi.org/phpBB3/viewtopic.php?p=127325#p127325>`_  by MrEngman is a useful interactive way to setup your WiFi. It can also update your system and your firmware automatically. If you already have WLAN interfaces defined in /etc/network/interfaces, remove them before running the script. The script failed the first time I ran it because it tried to update existing interfaces that were not properly configured.

To improve the stability of your WiFi, it is recommended to disable power management. For the EW7811, which is based on a Realtek 8192CU you do this as follows:

#. Create a new file ``8192cu.conf`` in ``/etc/modprobe.d/``:

.. code-block:: bash

    sudo nano /etc/modprobe.d/8192cu.conf

#. Add this line to the file and save:

.. code-block:: bash

    options 8192cu rtw_power_mgnt=0 rtw_enusbss=0

Alternatively you can add a line to your crontab to ping your router every minute to keep the connection alive. Open your current users crontab with:

.. code-block:: bash

    crontab -e

And add this line (replace the IP with your routers IP address, the standard gateway address in your IP settings):

.. code-block:: bash

    * * * * * ping -c 1 192.168.0.1


Setting up a static IP address
------------------------------

You probably want your Pi to always have the same IP address, so after setting up your WiFi change your interfaces file to a static IP address.
To edit your interfaces, you can run:

.. code-block:: bash

    sudo nano /etc/network/interfaces

My /etc/network/interfaces file looks like this:

.. code-block:: bash

    auto lo
    iface lo inet loopback
    iface eth0 inet dhcp
    allow-hotplug wlan0
    auto wlan0
    iface wlan0 inet static
    address 192.168.0.6
    netmask 255.255.255.0
    gateway 192.168.0.1
    wpa-ssid "YOUR_SSID"
    wpa-psk "YOUR_PASSPHRASE"

The right IP addresses depend on your home network setup. You can run ifconfig before editing the interfaces and write the automatically assigned addresses down. However, it is recommended to pick a static Ip address that is outside of your router's DHCP range.

Logging in though SSH
---------------------

Now that you have your network settings configured, you can stop using a display and log in through SSH. Get `Putty <http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html>`_ and connect to the IP address you just configured (port 22, SSH). When you save your session, you can also save your password.
