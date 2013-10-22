.. BrewPi Documentation documentation master file, created by
   sphinx-quickstart on Sun Jun 23 20:28:44 2013.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to the BrewPi documentation!
================================================
This documentation is written in reStructured text format and `part of the brewpi-www repository <https://github.com/BrewPi/brewpi-www/tree/develop/docs>`_.
If you see something that could use some updating, please let me know! Even better: fix it yourself and send me a pull request on GitHub!

The steps below will help you to go from a blank SD card and an unprogrammed Arduino to a working BrewPi setup.
Install and update scripts are available to do most of the work for you. After flashing Raspbian Wheezy onto your Pi, these scripts will automate 80% of the process.
If you really want to, you can still do your setup manually or just check the manual setup guide to see what the install script will do for you.

.. toctree::
    :maxdepth: 2
    :numbered:

    installing-your-pi/rpi-setup
    automated-brewpi-install/automated-brewpi-install.rst
    manual-brewpi-install/manual-brewpi-install.rst
    after-install/program-arduino
    after-install/device-configuration
    updating-brewpi/update-script.rst
    faq/faq-index.rst
