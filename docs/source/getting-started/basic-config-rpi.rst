
Basic configuration of your Raspberry Pi
========================================
This step by step guide will help you to set everything up on your Raspberry Pi and Arduino.

Installing Linux on your Raspberry Pi
-------------------------------------

Go to the `Raspberry Pi download page <http://www.raspberrypi.org/downloads>`_ and download the latest Raspbian Wheezy image. This is the recommended image.
You can use `Win32DiskImager <http://www.softpedia.com/get/CD-DVD-Tools/Data-CD-DVD-Burning/Win32-Disk-Imager.shtml>`_ to write the image to your memory card with a card reader. If you have an old image on your card and cannot remove the partition with Windows, `SD Formatter <https://www.sdcard.org/downloads/formatter_3/>`_ can help you to format the SD card before writing the image.

When you have put the image on the card, plug in a keyboard, network cable and a monitor and use the on screen menu to configure the basic settings. If the menu doesn't come up automatically, type:

.. code-block:: bash

    sudo raspi-config


Keep your programs up to date with these commands:
.. code-block:: bash

    sudo apt-get update
    sudo apt-get upgrade


Make sure you also have the latest firmware version, and stay up to date using `rpi-update by Hexxeh <[https://github.com/Hexxeh/rpi-update>`_.
Firmware updates will often fix instability issues, so make sure you run one. USB used to be unstable on the pi, but the latest firmware fixed this.


*For Mac-specific instructions, see `Raspberry Pi SD Card Setup via Mac <http://wiki.brewpi.com/index.php/Raspberry_Pi_SD_Card_Setup_via_Mac>`_.*

If you enable SSH, this should be the last time you need a keyboard and monitor, but it might be wise to leave them plugged in when you are setting up WiFi. Use every menu option to set up your Pi properly. Especially don't forget to expand your partition, or you will run out of space during the setup! Trust me, I know.. Expanding the partition takes a while and there is no progress bar. It will take up to 20 minutes, but as long as your status LED is green, it is still working. Go grab a beer and `RDWHAHB <http://www.homebrewtalk.com/wiki/index.php/RDWHAHB>`_.

Setting up WiFi
---------------

I am using an Edimax EW-7811un WiFi dongle. The latest image has built in support for this dongle. I can highly recommend this dongle.
`This setup script <http://www.raspberrypi.org/phpBB3/viewtopic.php?p=127325#p127325>`_  by MrEngman is a useful interactive way to setup your WiFi. It can also update your system and your firmware automatically. If you already have WLAN interfaces defined in /etc/network/interfaces, remove them before running the script. The script failed the first time I ran it because it tried to update existing interfaces that were not properly configured.

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
