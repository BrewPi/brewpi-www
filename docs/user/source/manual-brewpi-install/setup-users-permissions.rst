Setting up users and permissions
================================
For security reasons, we will run the BrewPi python script under its own user account: an account without sudo rights.
We will set up the ``brewpi`` user and group now. The web interface will run under the user and group ``www-data``. The www-data user already exists.
We will add the ``brewpi`` user with ``useradd``, which automatically creates the group ``brewpi`` as well. Additionally, we are adding the user ``brewpi`` to the ``www-data`` and ``dialout`` groups (needed for access to the /var/www/ dir and serial ports, respectively).
Then, we set the password for the brewpi user with passwd.

.. code-block:: bash

    sudo useradd -m -k /dev/null -G www-data,dialout brewpi
    sudo passwd brewpi

Now, verify your work:

.. code-block:: bash

    id brewpi

You should see something similar to:

.. code-block:: bash

    uid=1001(brewpi) gid=1002(brewpi) groups=1002(brewpi),20(dialout),33(www-data)

The python script will reside in the brewpi home directory. It will log data to the ./data subdirectory, keep settings in ./settings and it will copy everything the web interface needs to know to /var/www/ and chown it to www-data. By doing it this way, the www-data user does not have to have any rights outside its own directory.
To allow the brewpi user to write to the directories owned by www-data, we will have to add it to the www-data group. We will also add the pi user to both groups to make it easier to work with the files.

.. code-block:: bash

    sudo usermod -a -G www-data pi
    sudo usermod -a -G brewpi pi

To make sure that all newly created files in the www-data directory have www-data as group, even when they are created by the brewpi user, we set the sticky bit on the www-data directory and all its sub directories. We'll set the sticky bit for the brewpi home directory as well. Run the following commands:

.. code-block:: bash

    sudo chown -R www-data:www-data /var/www
    sudo chown -R brewpi:brewpi /home/brewpi
    sudo find /home/brewpi -type f -exec chmod g+rwx {} \;
    sudo find /home/brewpi -type d -exec chmod g+rwxs {} \;
    sudo find /var/www -type d -exec chmod g+rwxs {} \;
    sudo find /var/www -type f -exec chmod g+rwx {} \;

These commands do the following things:

* Set the ownership of all files and subdirectories to brewpi and www-data (first two lines)
* Give the group all permissions on all files (third and fourth line)
* Give the group all permissions and set the sticky bit on all directories (fifth and sixth line).


Fixing permissions issues
-------------------------
If you run into permission issues later, you can use a script included with the brewpi-script repository to fix it.
This could happen for example when you did not run git as the brewpi user or the www-data user, which results in the owner of the files being ``pi`` or ``root``.
This will cause errors when the web interface or script tries to access files.
This script just executes the commands above. Run it with:

.. code-block:: bash

    sudo /home/brewpi/utils/fixPermissions.sh


Starting and stopping the python script
---------------------------------------
There is a button in the web interface to start and stop the brewpi script. But allowing the www-data user to start python scripts would create a huge security risk.
This is solved by running a CRON job: every minute the system checks whether the script should be running and starts it when it does.
This way the www-data user only has to create/remove a file in the web directory. We will set this up after getting the BrewPi files from Git.
