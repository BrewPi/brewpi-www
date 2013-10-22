Using Git for BrewPi
====================
BrewPi uses Git, a distributed version control system, and hosts its source code on GitHub. GitHub makes it easy to share code and to collaborate with other developers.
To download BrewPi to your Raspberry Pi, we will clone the BrewPi repositories from the server to your device. A git clone copies the current version of all files, but also all other versions and the complete history in the .git directory.

To use Git, you will first have to install it with:

.. code-block:: bash

    sudo apt-get install git-core

BrewPi is divided into 3 projects, which are all hosted on GitHub. To make you understand a bit better how BrewPi is build up, here is a short explanation of what each part does.

The Arduino code: brewpi-avr
----------------------------
The Arduino runs all temperature control, reads sensors, switches actuators and drives the display. BrewPi can run standalone on the Arduino and maintain a constant beer temperature, so if your Raspberry Pi crashes, your beer is still safe.

If you just use the standard BrewPi shields and do not want to mess with the code, you can just download the latest HEX file to upload to your Arduino from the BrewPi servers at http://dl.brewpi.com.

The brewpi-avr repository can be found at https://github.com/BrewPi/brewpi-avr.
This repository contains the code that runs on the Arduino. Because the Arduino IDE is basically just a crappy notepad with an upload button, we are using Atmel Studio to write our code. We just include the Arduino libraries in the project. Atmel Studio is built with the Visual Studio 2010 shell, which makes coding a lot faster and less frustrating.

The python script: brewpi-script
--------------------------------
This repository contains the BrewPi Python script. This python script connects to the Arduino and listens to incoming connections from the web interface. These are the main functions the script provides:

* Periodically request data from the Arduino and write it to files for displaying it in graphs
* If BrewPi is running in profile mode, the python script reads a profile and continuously updates the beer temperature setting
* The python script can reprogram the Arduino
* The python script manages settings and forms an API layer between the Arduino and the web interface.

The brewpi-script repository can be found at https://github.com/BrewPi/brewpi-script.

Cloning the remote repository
"""""""""""""""""""""""""""""
The following command will clone the brewpi-script repository into ``/home/brewpi``, an empty directory you should have created in the previous step. The python script will run as the brewpi user, so it is best if we run Git as the brewpi user too, so all new files are owned by the brewpi user. We do this by adding ``sudo -u brewpi`` to the command.


.. code-block:: bash

    sudo -u brewpi git clone https://github.com/BrewPi/brewpi-script /home/brewpi

After the git clone, Git will remember where you got the files from: the URL above is stored as the default remote, named ``origin``.
There are different branches within the repository, the most import ones being ``master`` and ``develop``. ``master`` will contain the latest stable code and is checked out by default. ``develop`` will have the latest updates, but it is not guaranteed to be stable. So for normal uses, it is recommended to just stick to ``master``.

Switching between branches
""""""""""""""""""""""""""
To switch to a different branch, you use ``git checkout``:

.. code-block:: bash

    cd /home/brewpi
    sudo -u brewpi git checkout develop


Updating to the latest version
""""""""""""""""""""""""""""""
With the files in version control, updating is easy too:

.. code-block:: bash

    cd /home/brewpi
    sudo -u brewpi git pull

Git pull is a combination of two commands: ``git fetch``, which will update your local copy of the remote, and ``git merge``, which merges the changes from the remote with your local files.


Dealing with local changes
""""""""""""""""""""""""""
If you have changed files locally, the commands above will likely fail because of a conflict. ``git stash`` comes in handy in that case. ``git stash`` stashes your local changes away, so you have an unmodified copy of the latest commit again.

.. code-block:: bash

    sudo -u brewpi git stash

After the stash you can do the pull or checkout you wanted to do. If you want your local changes back afterwards, you can get them back from the stash again with ``git stash pop``.

.. code-block:: bash

    sudo -u brewpi git stash pop

Resetting to the latest commit
""""""""""""""""""""""""""""""
If you have messed up your local copy and want to reset everything to the latest commit:

.. code-block:: bash

    sudo -u brewpi git reset


The web interface: brewpi-www
-----------------------------

This project is for the web interface of brewpi: PHP, JavaScript, CSS and all other files that make up the web interface. The web interface should be your primary way to interact with BrewPi: watch the graphs, change the settings and check the log files. Everything the brewpi-script does is executed from the web interface: the script has a listening socket which be web interface can send message to. The script will start actions or return data based on the message content.

The brewpi-www repository can be found at https://github.com/BrewPi/brewpi-www


Cloning the remote repository
"""""""""""""""""""""""""""""
As before, we will clone the remote repository to a local directory. In this case this is the web server's root directory: ``/var/www``. The web server runs as the www-data user, so we will also run git as the www-data user this time.

The directory should be empty, so check if you have left any files from previous steps and remove them.

.. code-block:: bash

    ls /var/www
    sudo rm /var/www/*
    sudo -u www-data git clone https://github.com/BrewPi/brewpi-www /var/www


The other git commands for easy copy pasting in /var/www
""""""""""""""""""""""""""""""""""""""""""""""""""""""""
Here are the other git commands again, but now ran as the www-data user, so you can easily copy/paste them.
They should all be run from the /var/www directory.
You don't have to run these now.

.. code-block:: bash

    sudo -u www-data git checkout develop
    sudo -u www-data git pull
    sudo -u www-data git stash
    sudo -u www-data git stash pop
    sudo -u www-data git reset


Now that we have checked out all the BrewPi files, we just have to set a few settings.

Fixing permissions after git commands
"""""""""""""""""""""""""""""""""""""
Not all permissions can be stored in git, which is why the permissions are usually wrong after working with git.
You can run the fixPermissions script in the brewpi-script/utils directory for fix all permissions at once.
