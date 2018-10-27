[![CircleCI](https://circleci.com/gh/yoichiro/actions-tools.svg?style=svg)](https://circleci.com/gh/yoichiro/actions-tools)
[![NPM Version](https://img.shields.io/npm/v/actions-tools.svg)](https://www.npmjs.org/package/actions-tools)

# actions-tools

This provides you some useful tools to build your actions for the Google Assistant. Currently, the following tools provided:

* setup - This tool allows you to set up your credential to work other tools.
* interactive - This tool provides you to do a conversation between the Google Assistant and you in your terminal.
* autopilot - This tool allows you to talk with the Google Assistant automatically with phrases you prepared in advance.

![interactive](https://user-images.githubusercontent.com/261787/47473717-b6c1c100-d84e-11e8-824f-d087f06d1e73.png)

# How to Install

Install this with either `npm install actions-tools -g` or `yarn global add actions-tools`.

# How to Use: setup

First, you have to prepare your credential with the setup tool before using other tools. The preparation consists of some steps.

1. Create a new project on Actions on Google.
1. Download OAuth 2.0 credential file.
1. Enable the Google Assistant API.
1. Convert the credential file.

## Create a new project

To use this, you need to create a new project on Actions on Google.

1. Visit the [Actions on Google console](https://console.actions.google.com/).
1. Click the `Add/import project` button.
1. Fill in your project name, and click `CREATE PROJECT` button.

## Download credential file

Then, register a new device to your project, and download a credential file.

1. In the next page, there is a "Device registration" item in the bottom of the page. Click it.
1. Click the `REGISTER MODEL` button. The Register model dialog should be opened.
1. Fill in each field as like the following, then click the `REGISTER MODEL` button.
   * Product name - Any product name (ex. “my product”)
   * Manufacturer name - Any manufacturer name (ex. “my company”)
   * Device type - Light (Of course, you can select other item)
1. In the next page on the dialog, click the `Download credentials.json` button.
1. Specify the directory you want to save the file. The `credentials.json` file downloaded.
1. Click the `NEXT` button, and click the `SKIP` button on the next page.

You should got the OAuth 2.0 credential file by doing the steps above.

## Enable Google Assistant API

This uses the Google Assistant API to communicate with the Google Assistant. You need to turn on the Google Assistant API for your project that you created at previous step.

Do the following step to enable the Google Assistant API:

1. Open your Web browser, and access to the following URL.
   * https://console.cloud.google.com/apis/library/embeddedassistant.googleapis.com?q=Assistant
1. If your target project is not selected, select the target project you created at the previous step on the top of the page.
1. Click the `ENABLE` button to turn on the Google Assistant API.

## Convert credential file

Next, you need to convert the downloaded file with the setup tool. In your terminal, execute the following command:

```bash
$ cd <YOUR_FAVORITE_DIRECTORY>
$ actions-tools setup -s <YOUR_DOWNLOADED_FILE_PATH>
```

* YOUR_FAVORITE_DIRECTORY - You can specify any directory to work this setting up.
* YOUR_DOWNLOADED_FILE_PATH - This is a file path of the file you downloaded at the previous step.

The setup tool can accept the following options:

* `-s` or `--source` - The OAuth 2.0 credential file path that you downloaded from the Actions on Google. Required.
* `-o` or `--output` - The converted file path. If omitted, the `./credentials.json` file path is specified.

After the execution of the setup tool, you will see the URL that the setup tool generated. Copy the URL, then open your Web browser and open the URL.

```bash
$ actions-tools setup -s ./client_secret_12345.json
Go to the following URL to authorize in your Web browser, then paste the code below:
https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fassistant-sdk-prototype&response_type=code&client_id=115...61cl.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob
Authorization code:
```

In your Web browser, authenticate your Google Account and authorize an access to the Google Assistant API. Finally, you will see the authorization code. Copy the code.

Back to your terminal, paste the authorization code. Then, the converted `credentials.json` file (or the file name you specified by the `-o` option) should be created.

# How to use: interactive

The interactive tool allows you to talk to the Google Assistant in your terminal. When you're developing your action, you can talk to your action immediately.

To use the interactive tool, execute the following command in your terminal:

```bash
$ actions-tools interactive
```

The interactive tool can accept the following options:

* `-c` or `--credential` - The file path of the converted credential JSON file. If omitted, the `./credentials.json` is applied.
* `-l` or `--locale` - The locale used during conversation with the Google Assistant. If omitted, the `en-US` is applied.
* `-v` or `--level` - The output level. You can specify either `simple` and `debug`. If the `simple` selected, `displayText` strings will be outputted. Otherwise, all structures that consists of the response from the Google Assistant will be outputted. If omitted, the `simple` is applied.
* `-s` or `--screen` - If you want to support the screen surface in addition to the audio, you can use this option. You can specify either `off`, `open`, `file` and `full`. If omitted, the `off` is applied.
  * `off` - Not support the screen surface.
  * `open` - Open the screen out data with your Web browser (Actually, the response data is passed to the `open` command).
  * `file` - Save the response data to the file in the specified directory by the `-o` option.
  * `full` - Both `open` and `file`.
* `-o` - This option is required when the `-s` option is specified and the value is `file` or `full`. You can specify the directory path where each response screen out data is written as a file. If omitted, the `./` value is applied.

![debug](https://user-images.githubusercontent.com/261787/47474464-fb029080-d851-11e8-96c9-2f98c027acaa.png)

The interactive tool asks you the phrase you want to send to the Google Assistant. When you types the phrase and press Enter key, the phrase is sent to the Google Assistant. After a few seconds, the response from the Google Assistant will be shown. Then, the interactive tool asks your input again.

If you want to exit from the interactive tool, press `Ctrl+C` key.

You can see each response for the screen surface, if you specify the `-s` option. Using the `open` value for the `-s` option, you can see each response in your Web browser in realtime.

![screen_surface_open](https://user-images.githubusercontent.com/261787/47600241-21166500-d9f9-11e8-8f16-b0d5708e610c.png)

In the other hand, using the `file` value for the `-s` option, you can save each response data as a file into the directory you specify with the `-o` option.

# How to use: autopilot

Basically, in the interactive tool described at the previous section, you need to type phrases each time. Therefore, you would need to type same phrases over again and again during testing your action. This is not a productive.

The autopilot tool allows you to type phrases automatically. You can define phrases that you want to send to the Google Assistant in the YAML file named "Dialog file". The autopilot tool reads the definition file and send each phrase to the Google Assistant instead of you.

## Define Dialog file

The Dialog file is written by the YAML format. The sample dialog file is the following:

```yaml
locale: en-US
dialogs:
  -
    phrase: "Hello!"
  -
    phrase: "What time is it now?"
  -
    phrase: "Thank you."
```

The dialog file consists of the following items:

* `locale` - String. The locale string to be used on the conversation with the Google Assistant.
* `dialogs` - Array. This has each phrase you want to send to the Google Assistant.
  * `phrase` - String. The phrase sent to the Google Assistant.

## Execute autopilot

After creating the dialog file, you can start the conversation defined by the dialog file with the autopilot tool. In your terminal, execute the following command:

```bash
$ actions-tools autopilot -i dialog.yaml
```

The interactive tool can accept the following options:

* `-i` or `--input` - The file path of your dialog file. Required.
* `-c` or `--credential` - The file path of the converted credential JSON file. If omitted, the `./credentials.json` is applied.
* `-v` or `--level` - The output level. You can specify either `simple` and `debug`. If the `simple` selected, `displayText` strings will be outputted. Otherwise, all structures that consists of the response from the Google Assistant will be outputted. If omitted, the `simple` is applied.
* `-s` or `--screen` - If you want to support the screen surface in addition to the audio, you can use this option. You can specify either `off`, `open`, `file` and `full`. If omitted, the `off` is applied.
  * `off` - Not support the screen surface.
  * `open` - Open the screen out data with your Web browser (Actually, the response data is passed to the `open` command).
  * `file` - Save the response data to the file in the specified directory by the `-o` option.
  * `full` - Both `open` and `file`.
* `-o` - This option is required when the `-s` option is specified and the value is `file` or `full`. You can specify the directory path where each response screen out data is written as a file. If omitted, the `./` value is applied.

The autopilot tool reads the content of your dialog file and sends each phrase. You will see each response from the Google Assistant.

![autopilot](https://user-images.githubusercontent.com/261787/47474541-65b3cc00-d852-11e8-8abc-5a7f4dc822ca.png)

# License

See the LICENSE file.
