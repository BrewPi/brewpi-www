Basic configuration of your Raspberry Pi
========================================
This step by step guide will help you to set everything up on your Raspberry Pi and Arduino.

Installing Linux on your Raspberry Pi
-------------------------------------
The easiest cross-platform way to install Linux on your Raspberry Pi is using the NOOBS installer.

#. Go to the `Raspberry Pi download page <http://www.raspberrypi.org/downloads>`_
#. Download the NOOBS zip file.
#. Download SDFormatter (link on download page too).
#. Format your SD card with SDFormatter. The defaults are okay.
#. Extract the contents of the NOOBS zip file to your SD card.
#. Put the SD card in your Raspberry Pi and boot it.
#. You will get a menu to choose which OS you want to install, choose Raspbian.


Windows users can also use `Win32DiskImager <http://www.softpedia.com/get/CD-DVD-Tools/Data-CD-DVD-Burning/Win32-Disk-Imager.shtml>`_
to write the image to the SD card. If you have an old image on your card and cannot remove the partition with Windows,
`SD Formatter <https://www.sdcard.org/downloads/formatter_3/>`_ can help you to format the SD card before writing the image.

A list of recommended SD cards can be found at http://elinux.org/RPi_SD_cards
The default login credentials for the image are username ``pi`` and password ``raspberry``.
You can change the password in the next step.


Configuring your system
-----------------------
SSH is enabled by default in the image you installed.
If you have an Ethernet cable connected, you may SSH into the Pi to begin your configuration.
The wired ethernet port is set to receive a dynamic IP address using DHCP. To find out which IP it got, use your router's web interface.

To connect via ssh, you will need an SSH client such as `Putty <http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html>`_
Connect to the IP address your Pi is using (port 22, SSH). When you save your session, you can also save your password.

Alternatively, you may also plug in a keyboard and monitor and use the on screen menu to configure the basic settings.

If the basic system settings menu doesn't come up automatically, type:

.. code-block:: bash

    sudo raspi-config


Setting up WiFi
---------------

I am using an Edimax EW-7811un WiFi dongle. The latest image has built in support for this dongle. I can highly recommend this dongle.
The dongle is based on a Realtek 8192CU or 8188CUS, but the 8192cu driver that ships with Raspbian works for both.

To improve the stability of your WiFi, it is recommended to disable power management:

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

The right IP addresses depend on your home network setup.
You can run ifconfig before editing the interfaces and write the automatically assigned addresses down.
However, it is recommended to pick a static Ip address that is outside of your router's DHCP range.


Updating programs
-----------------

Keep your programs up to date with these commands:

.. code-block:: bash

    sudo apt-get update
    sudo apt-get upgrade


Updating firmware
-----------------

Make sure you also have the latest firmware version, and stay up to date using `rpi-update by Hexxeh <https://github.com/Hexxeh/rpi-update>`_.
Firmware updates will often fix instability issues, so make sure you run one.
