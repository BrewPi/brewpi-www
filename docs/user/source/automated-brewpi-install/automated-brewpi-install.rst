Automated installation of BrewPi
================================
We created scripts to install and update BrewPi, these scripts are part of the `brewpi-tools repository on GitHub <https://github.com/BrewPi/brewpi-tools>`_.
The install script will install all dependencies, set up users and permissions, download the latest code base and setup a CRON job.
Just answer the questions on the screen.


Getting and running the install script
--------------------------------------
You can get the install and update scripts by cloning the BrewPi tools repository from GitHub.
The scripts use git to check for self-updates, so keep them inside the repository.

Use the following commands to clone the repository to the your current user's home dir and to run the install script:

.. code-block:: bash

    git clone https://github.com/BrewPi/brewpi-tools.git ~/brewpi-tools
    sudo ~/brewpi-tools/install.sh

Now just follow the instructions on the screen. The install script will remove everything in the install directories you pick (after making a backup).
So if you want a fresh start, you can always rerun the installer.

After the install has finished
------------------------------
If the installation was successful, your next step is to program the Arduino via the web interface.
You can find the instructions :doc:`here <../after-install/program-arduino>`.

After that, your last step will be to :doc:`to set up your devices in the device manager <../after-install/device-configuration>`.
