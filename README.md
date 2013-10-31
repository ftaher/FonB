FonB
====

The Phonebook Solution for Asterisk
---------------

This is development repository for Forntend code of [Aptus FonB Asterisk Phonebook Solution](http://aptus.com). It was made public, so we can get feedback and pull requests from Asterisk community and connect with them. Also, you can use this repository to test latest frontend changes on your current FonB installation before we release it officially. 

Testing Latest Frontend Code
------------------

To test latest frontend code follow these steps:
- Download [this repository as zip](https://github.com/aptus/FonB/archive/master.zip) and extract in your home directory. (We assume you extracted it in /home/jim/PhoneB)
- Symlink php directory from your FonB base directory (defaults to `/usr/local/PhoneB`) to the directory where you extracted zip archive. Example command: `ln -s /usr/local/PhoneB/php /home/jim/PhoneB/php`
- Edit `/etc/phoneb/users.cfg` and change BaseDir for your extension to directory where you extracted latest code. For example:

```python
  [7576]
  Extension = 7576
  Terminal = "SIP/7576"
  Context = "from-internal"
  Name = "Jim Carry"
  Mobile = 90445454546456
  BaseDir = "/usr/local/PhoneB"
  Language = "en"
  Department = "Development"
  Spy = "all"
  Company = "my-company"
```
will change to:
```python
  [7576]
  Extension = 7576
  Terminal = "SIP/7576"
  Context = "from-internal"
  Name = "Jim Carry"
  Mobile = 90445454546456
  BaseDir = "/home/jim/PhoneB"
  Language = "en"
  Department = "Development"
  Spy = "all"
  Company = "my-company"
```
 - You can also change `BaseDir` in `/etc/phoneb/phoneb.cfg` to mark new code as default frontend code. For example:

```python
  [PhoneB]
  BaseDir = "/usr/local/PhoneB"
```
will change to:
```python
  [PhoneB]
  BaseDir = "/home/jim/PhoneB"
```
 - Reload phoneb to see the latest frontend.

Contributing
-----------

Aptus welcomes suggestions, bug reports, feature requests and pull requests from community. If you don't have any issues or code to push, you can still help us by translating FonB to your local language. Thanks for your help, you are awesome :)




--------

**Warning:** This is a development repository, so it may contain unstable code. Stable version of Frontend code and backend server is available at [FonB Download Page](http://aptus.com/download/). All the [releases](https://github.com/aptus/FonB/releases) can also be accessed on github.
