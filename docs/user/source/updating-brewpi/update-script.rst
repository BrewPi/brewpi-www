Updating BrewPi with our upgrade script
=======================================
We have written a Python script to help you check for updates and apply them.
This script checks both the web interface and the brewpi script directory for updates.

Getting the update script
-------------------------
If you didn't clone the `brewpi-tools repository on GitHub <https://github.com/BrewPi/brewpi-tools>`_ repository already,
you can do it with the following command. This will clone it from GitHub into your current user's home directory.

.. code-block:: bash

    git clone https://github.com/BrewPi/brewpi-tools.git ~/brewpi-tools

Updating BrewPi
---------------
Please stop the script before running the updater, using the web interface.

To run the update script, use the following command:

.. code-block:: bash

    sudo ~/brewpi-tools/updater.py

The script will display a menu to to choose which branch you would like to update. It defaults to the currently active branch.
If you pick another branch, it will check it out for you.

The script will pull from the remote to update. If merging the updates fails, the script will ask you to stash your local changes.
This commits your changes to the git stash and bring your repository back to its original state.
You can get your changes back with 'git stash pop', but be warned that your changes could be incompatible with the latest updates.

Scripts that run after the update
---------------------------------
After updating, the updater calls the `utils/runAfterUpdate.sh <https://github.com/BrewPi/brewpi-script/blob/master/utils/runAfterUpdate.sh>`_
script from the brewpi-scripts directory. This script will install any new dependencies, update the CRON job and fix file permissions.


Using the updater with your own remote / GitHub account.
--------------------------------------------------------
The update script just reads the remotes from the config files in the repositories.
If you add your own remotes, it will display a menu to choose a remote to update from. So if you forked BrewPi on GitHub,
you can also use the updater to update from your own repository.


