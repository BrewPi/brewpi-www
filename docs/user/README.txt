This directory contains documentation in reStructuredText format.
It is compiled to HTML by Sphinx, a python documentation generator.

A bat file is included to generate the documentation on windows.
You will have to install the python module sphinx, which for example can be done using easy_install.

After installing sphinx, set the environment variable SPHINXBUILD to the full path of sphinx-build.exe, e.g. :
C:\Python27\Scripts\sphinx-build.exe
A reboot might be necessary.

You can compile the HTML documentation with:
make.bat html

Contributions to the documentation are very welcome! Please send me pull requests on GitHub!

The docs in brewpi-www contain:
 * General user oriented documentation (like Getting Started)
 * Web interface specific developer documentation: JavaScript, PHP, CSS

Documentation for the API layer in Python will be added to the brewpi-script repo.
Documentation for the code that runs on the Arduino (C++) will go into the brewpi-avr repo.

The docs from all 3 repositories will be combined by our build server and published on the BrewPi website.
By keeping the docs in the repositories, they can be updated and committed at the same time as the code.

IntelliJ IDEA has a plugin by JetBrains for reStructured text, which you can install through the plugin manager.
