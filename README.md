[![CircleCI](https://circleci.com/gh/yoichiro/actions-tools.svg?style=svg)](https://circleci.com/gh/yoichiro/actions-tools)
[![NPM Version](https://img.shields.io/npm/v/actions-tools.svg)](https://www.npmjs.org/package/actions-tools)

# actions-tools

This provides you some useful tools to build your actions for the Google Assistant. Currently, the following tools provided:

* setup - This tool allows you to set up your credential to work other tools.
* interactive - This tool provides you to do a conversation between the Google Assistant and you in your terminal.
* autopilot - This tool allows you to talk with the Google Assistant automatically with phrases you prepared in advance.
* test - This tool allows you to test your action talking with the Google Assistant.

![interactive](https://user-images.githubusercontent.com/261787/47630450-310e8000-db84-11e8-99d7-e9b9c0cf3441.png)

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

# How to Use: interactive

The interactive tool allows you to talk to the Google Assistant in your terminal. When you're developing your action, you can talk to your action immediately.

To use the interactive tool, execute the following command in your terminal:

```bash
$ actions-tools interactive
```

The interactive tool can accept the following options:

* `-c` or `--credential` - The file path of the converted credential JSON file. If omitted, the `./credentials.json` is applied.
* `-l` or `--locale` - The locale used during conversation with the Google Assistant. If omitted, the `en-US` is applied.
* `-v` or `--level` - The output level. You can specify either `simple` and `debug`. If the `simple` selected, `displayText` strings will be outputted. Otherwise, all structures that consists of the response from the Google Assistant will be outputted. If omitted, the `simple` is applied.
* `-s` or `--screen` - If you want to support the screen surface in addition to the audio, you use this option. You can specify either `off`, `file` and `play`. If omitted, the `off` is applied.
  * `off` - Not support the screen surface.
  * `file` - Save the response data to the file in the specified directory by the `-o` option.
  * `play` - Not only `file`, but also open the screen out data with your Web browser (Actually, the response data is passed to the `open` command. See [opn](https://github.com/sindresorhus/opn)).
* `-a` or `--audio` - If you want to store and/or play the audio, you use this option. You can specify either `off`, `file` and `play`. If omitted, the `off` is applied.
  * `off` - Do nothing.
  * `file` - Save the response data to the file in the specified directory by the `-o` option.
  * `play` - Not only `file`, but also play the audio out data (Actually, a command you have will be used to play the MP3 file. See [play-sound](https://github.com/shime/play-sound)).
* `-o` or `--output` - This option is required when the `-s` and/or `-a` option are specified and the value is `file` or `play`. You can specify the directory path where each response screen out data is written as a file. If omitted, the `./` value is applied.
* `-r` or `--rich` - Turn on/off the rich output (color and emoji). If omitted, the `true` is applied.

![debug](https://user-images.githubusercontent.com/261787/47630495-75018500-db84-11e8-9f8a-598eafe1d0b0.png)

The interactive tool asks you the phrase you want to send to the Google Assistant. When you types the phrase and press Enter key, the phrase is sent to the Google Assistant. After a few seconds, the response from the Google Assistant will be shown. Then, the interactive tool asks your input again.

If you want to exit from the interactive tool, press `Ctrl+C` key.

Using the `file` value for the `-s` option, you can save each response data as a file into the directory you specify with the `-o` option.

In addition, using the `play` value for the `-s` option, you can see each response in your Web browser in realtime.

![screen_surface_open](https://user-images.githubusercontent.com/261787/47600241-21166500-d9f9-11e8-8f16-b0d5708e610c.png)

# How to Use: autopilot

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
* `-s` or `--screen` - If you want to support the screen surface in addition to the audio, you use this option. You can specify either `off`, `file` and `play`. If omitted, the `off` is applied.
  * `off` - Not support the screen surface.
  * `file` - Save the response data to the file in the specified directory by the `-o` option.
  * `play` - Not only `file`, but also open the screen out data with your Web browser (Actually, the response data is passed to the `open` command. See [opn](https://github.com/sindresorhus/opn)).
* `-a` or `--audio` - If you want to store and/or play the audio, you use this option. You can specify either `off`, `file` and `play`. If omitted, the `off` is applied.
  * `off` - Do nothing.
  * `file` - Save the response data to the file in the specified directory by the `-o` option.
  * `play` - Not only `file`, but also play the audio out data (Actually, a command you have will be used to play the MP3 file. See [play-sound](https://github.com/shime/play-sound)).
* `-o` or `--output` - This option is required when the `-s` and/or `-a` option are specified and the value is `file` or `play`. You can specify the directory path where each response screen out data is written as a file. If omitted, the `./` value is applied.
* `-r` or `--rich` - Turn on/off the rich output (color and emoji). If omitted, the `true` is applied.

The autopilot tool reads the content of your dialog file and sends each phrase. You will see each response from the Google Assistant.

![autopilot](https://user-images.githubusercontent.com/261787/47630550-c873d300-db84-11e8-8f7e-4f1afd5baced.png)

# How to Use: test

The test tool allows you to test your actions with [Mocha](https://mochajs.org/) testing framework. You can write your test code easily using the `Conversation` object, which is set up to communicate to the Google Assistant in advance.

The test tool works as a launcher of Mocha. When you write your test code with Mocha, you can execute the test code on the Mocha from the test tool. Of course, you can use other libraries to write your test code, for example [Chai](https://www.chaijs.com/). To test your actions, you should need to talk to the Google Assistant from your test code. You can use the `Conversation` object, which has already been configured to communicate with the Google Assistant, in your test code.

You can write and run your test code by the following step. We use actions-tools, mocha and chai to write your test code.

## Prepare an environment

Here, create a directory and install dependencies.

1. Create a directory to put your test code and move to the directory in your terminal.
1. Link the actions-tools, which has already been installed in global, from the directory.
1. Install dependencies in the directory.

```bash
$ mkdir action-test
$ cd action-test
$ npm link actions-tools
$ npm install chai
```

## Write your test code

Write your test code with Mocha, Chai and `Conversation` object. The Mocha is a testing framework based on the Behavior-Driven Development, therefore, you can write your test code with `describe` and `it` and etc. The Chai is an assertion library and provides `should` and `expect` functions. Last, the `Conversation` object is provided by the actions-tools. You can retrieve the `Conversation` object, which has already been configured to communicate with the Google Assistant, by the following code:

```js
const tools = require("actions-tools");

const conv = tools.Testing.getConversation();
```

For example, the following code is to test the [Hexadecimal conversion](https://assistant.google.com/services/a/uid/0000004bc3374c18?hl=en-US) action.

```js
const {expect} = require("chai");
const tools = require("actions-tools");

const conv = tools.Testing.getConversation();

describe("Happy path - Hexadecimal conversion", () => {
    it("says a welcome message against starting the talk.", (done) => {
        conv.say("Talk to Hexadecimal conversion").then(response => {
            expect(response.displayText.length).to.equal(1);
            expect(response.displayText[0]).to.include(
                "Please say decimal or hexadecimal number.");
        }).then(done, done);
    });
    it("says converted numbers against saying the number", (done) => {
        conv.say("123").then(response => {
            expect(response.displayText.length).to.equal(1);
            expect(response.displayText[0]).to.include(
                "7b hexadecimal number");
            expect(response.displayText[0]).to.include(
                "291 decimal number");
        }).then(done, done);
    });
    it("ends the conversation against saying bye", (done) => {
        conv.say("bye").then(response => {
            expect(response.displayText.length).to.equal(1);
            expect(response.displayText[0]).to.equal("See you again");
        }).then(done, done);
    });
});
```

You can send user phrases with the `say` function of the `Conversion` object. The `say` function returns a `Promise` object. You can retrieve the response as the argument of the callback function passed to the `then` function. The structure of the response is the following:

* `displayText` - The array of `displayText` strings.
* `deviceAction` - Parsed [DeviceAction](https://developers.google.com/assistant/sdk/reference/rpc/google.assistant.embedded.v1alpha2#google.assistant.embedded.v1alpha2.DeviceAction) information.
* `expectUserResponse`: `boolean` - The boolean value of the `expectUserResponse` in [AppResponse](https://developers.google.com/actions/reference/rest/Shared.Types/AppResponse).
* `textToSpeech` - The array of `textToSpeech` strings.
* `ssml` - The array of `ssml` strings.
* `basicCard` - The array of Basic Card information represented by the [BasicCard](https://developers.google.com/actions/reference/rest/Shared.Types/AppResponse#basiccard).
* `carouselBrowse` - The array of Carousel Browse information represented by the [CarouselBrowse](https://developers.google.com/actions/reference/rest/Shared.Types/AppResponse#carouselbrowse).
* `mediaResponse` - The array of Media Response information represented by the [MediaResponse](https://developers.google.com/actions/reference/rest/Shared.Types/AppResponse#mediaresponse).
* `tableCards` - The array of the Table Card information represented by the [TableCard](https://developers.google.com/actions/reference/rest/Shared.Types/AppResponse#tablecard).
* `suggestions` - The array of suggestion chip strings.
* `linkOutSuggestions` - The [LinkOutSuggestion](https://developers.google.com/actions/reference/rest/Shared.Types/AppResponse#linkoutsuggestion) information.
* `possibleIntents` - The array of [ExpectedIntent](https://developers.google.com/actions/reference/rest/Shared.Types/AppResponse#expectedinput) information.
* `responseMetadata` - The response metadata information included in the [DebugInfo](https://developers.google.com/assistant/sdk/reference/rpc/google.assistant.embedded.v1alpha2#google.assistant.embedded.v1alpha2.DebugInfo).
* `screenOut` - The response when supporting a screen surface. This consists of the `format` and `data`.
* `audioOut` - The audio data formatted by MP3. This type is Uint8Array.

You need to create your test code file named `*test.js`. That is, the suffix of your test code file name must be `test.js`.

## Execute test code

After writing your test code, you can start your test with the test tool. In your terminal, execute the following command:

```bash
$ actions-tools test -i your_action.test.js
```

The interactive tool can accept the following options:

* `-i` or `--input` - The file path of your test file path. Required.
* `-c` or `--credential` - The file path of the converted credential JSON file. If omitted, the `./credentials.json` is applied.
* `-l` or `--locale` - The locale used during conversation with the Google Assistant. If omitted, the `en-US` is applied.
* `-r` or `--report` - The report format. You can specify one of the [supported reporters](https://mochajs.org/#reporters).

If you specify the `-i` value as a directory path, all files with `test.js` suffix in the directory are executed.

![2018-11-05 9 42 54](https://user-images.githubusercontent.com/261787/47972423-5dc01b80-e0df-11e8-92a9-737275431242.png)

# License

See the LICENSE file.
