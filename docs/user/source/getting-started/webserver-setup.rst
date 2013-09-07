Setting up your LAMP web server for BrewPi
==========================================
LAMP stands for Linux, Apache, MySQL, PHP: the applications that make up your web server.
This article explains how to install all of them on your pi.

Install Apache2
---------------
To install Apache2, execute the following commands:

.. code-block:: bash

    sudo apt-get update
    sudo apt-get install apache2
    sudo apt-get install libapache2-mod-php5 php5-cli php5-common php5-cgi

To test your server, you can now visit http://your-rpi-ip/.
By default, the root of your web server is ``/var/www/``

Install PHP
-----------
To install PHP, execute the following commands:

.. code-block:: bash

    sudo apt-get install php5

Once you have installed PHP, you can test it by creating a new php file in your ``/var/www/`` directory.
Open the text editor nano to create the file:

.. code-block:: bash

    sudo nano /var/www/phpinfo.php

This is what you want to put inside your file:

.. code-block:: php

    <?php
    phpinfo();
    ?>

To exit nano and save your file, you can use ``ctr-x``, to write the file but keep nano open, you can use ``ctrl-o``.

For security reasons, your web server runs as a separate user under Linux, the ``www-data`` user.
Your files in your /var/www/ directory should be owned by this user, otherwise your web server will not have the permissions to access the files. You can change owner of everything in your ``/var/www/`` directory to the ``www-data`` group and user with the following command. The ``-R`` flag recursively chowns all files and subdirectories.

.. code-block:: bash

    sudo chown -R www-data:www-data /var/www

You can test your PHP installation by viewing the result of your new file in a browser: http://your-rpi-ip/phpinfo.php. If that worked, please delete the file:

.. code-block:: bash

    sudo rm /var/www/phpinfo.php

If you ever need to restart your web server, you can use this command:

.. code-block:: bash

    sudo /etc/init.d/apache2 restart

Install MySQL
-------------
The current version of BrewPi doesn't use MySQL. It is recommended to not install it. If you want MySQL anyway, you can install it with these commands:

.. code-block:: bash

    sudo apt-get install mysql-server mysql-client php5-mysql

To manage your databases from a web interface, you can install PHPMyAdmin:

.. code-block:: bash

    sudo apt-get install libapache2-mod-auth-mysql php5-mysql phpmyadmin

Remember to select Apache2 with the space bar when it comes up! After installation, reboot and test: http://your-rpi-ip/phpmyadmin. Reboot with the command:

.. code-block:: bash

    sudo shutdown -r now

To easily see when your pi is back online, create a shortcut in your quick launch bar with the following target (for the correct IP address of course):

.. code-block:: bash

    C:\Windows\System32\cmd.exe /c "ping -t 192.168.0.6"

That will open a command window that keeps pinging your Raspberry Pi.

If you mess up the installation of MySQL, because you didn't listen and did not expand your root partition, it can be a bitch to remove and re-install. The following worked for me eventually:

.. code-block:: bash

    sudo apt-get autoremove --purge mysql-server mysql-server-5.5 mysql-common
    sudo rm /var/lib/mysql/ -rf
    sudo rm /etc/mysql -rf
    sudo apt-get install -f mysql-server
