import * as yargs from "yargs"
import {Interactive} from "./interactive"
import {Setup} from "./setup"
import {Conversation} from "./conversation"
import * as fs from "fs"
import {Autopilot} from "./autopilot"

export class ActionsToolsCommand {

    main(): void {
        const def = this._createArgumentsDefinition()
        const args = def.argv
        const isValidCommandName = ["interactive", "setup", "autopilot"].some((x: string): boolean => {
            return x === args._[0]
        })
        if (args._.length === 0 || !isValidCommandName) {
            this._showHelp(def)
        }
    }

    _createArgumentsDefinition(): yargs.Argv {
        return yargs(process.argv.slice(2))
            .usage("Usage: action-test <Command>")
            .command("setup", "Setup credential file", (yargs: yargs.Argv) => {
                return yargs
                    .usage("Usage: actions-tools setup [Options]")
                    .example("actions-tools setup -s ./client_secret_12345.json", "")
                    .option("secret", {
                        alias: "s",
                        description: "Your client secret file path",
                        type: "string",
                        demandOption: true,
                    })
                    .option("output", {
                        alias: "o",
                        description: "Output file path",
                        type: "string",
                        default: "./credentials.json",
                    })
            }, async (args: yargs.Arguments) => {
                await this._startSetup(args.secret, args.output)
            })
            .command("interactive", "Interactive mode", (yargs: yargs.Argv) => {
                return yargs
                    .usage("Usage: actions-tools interactive [Options]")
                    .example("actions-tests interactive",
                        "")
                    .option("credential", {
                        alias: "c",
                        description: "Your credential file path",
                        default: "./credentials.json",
                        type: "string",
                    })
                    .option("locale", {
                        alias: "l",
                        description: "Locale string",
                        default: "en-US",
                        type: "string",
                    })
                    .option("level", {
                        alias: "v",
                        description: "Output level (simple, debug)",
                        default: "simple",
                        type: "string",
                        choices: ["simple", "debug"],
                    })
                    .option("screen", {
                        alias: "s",
                        description: "Screen surface (off, file, play)",
                        type: "string",
                        choices: ["off", "file", "play"],
                        default: "off",
                    })
                    .option("audio", {
                        alias: "a",
                        description: "Audio surface (off, file, play)",
                        type: "string",
                        choices: ["off", "file", "play"],
                        default: "off",
                    })
                    .option("output", {
                        alias: "o",
                        description: "Output directory path for screen/audio out data",
                        default: "./",
                        type: "string",
                    })
            }, async (args: yargs.Arguments) => {
                await this._startInteraction(
                    args.credential,
                    args.locale,
                    args.level,
                    args.screen,
                    args.audio,
                    args.output,
                )
                this._exit()
            })
            .command("autopilot", "Autopilot mode", (yargs: yargs.Argv) => {
                return yargs
                    .usage("Usage: actions-tools autopilot [Options]")
                    .example("actions-tests autopilot",
                        "")
                    .option("input", {
                        alias: "i",
                        description: "Your conversation definition input file path",
                        type: "string",
                        demandOption: true,
                    })
                    .option("credential", {
                        alias: "c",
                        description: "Your credential file path",
                        default: "./credentials.json",
                        type: "string",
                    })
                    .option("level", {
                        alias: "v",
                        description: "Output level (simple, debug)",
                        default: "simple",
                        type: "string",
                        choices: ["simple", "debug"],
                    })
                    .option("screen", {
                        alias: "s",
                        description: "Screen surface (off, file, play)",
                        type: "string",
                        choices: ["off", "file", "play"],
                        default: "off",
                    })
                    .option("audio", {
                        alias: "a",
                        description: "Audio surface (off, file, play)",
                        type: "string",
                        choices: ["off", "file", "play"],
                        default: "off",
                    })
                    .option("output", {
                        alias: "o",
                        description: "Output directory path for screen/audio out data",
                        default: "./",
                        type: "string",
                    })
            }, async (args: yargs.Arguments) => {
                await this._startAutopilot(
                    args.input,
                    args.credential,
                    args.level,
                    args.screen,
                    args.audio,
                    args.output,
                )
                this._exit()
            })
            .fail((msg: string, err: Error) => {
                this._onFail(msg || err.message)
            })
            .version(false)
            .help()
            .wrap(yargs.terminalWidth())
    }

    _exit(): void {
        process.exit(0)
    }

    async _startInteraction(credential: string,
                            locale: string,
                            level: string,
                            screen: string,
                            audio: string,
                            output: string): Promise<void> {
        const interactive = this._createInteractive(credential, locale, level, screen, audio, output)
        await interactive.start()
    }

    _createInteractive(credential: string,
                       locale: string,
                       level: string,
                       screen: string,
                       audio: string,
                       output: string): Interactive {
        const conversation = new Conversation(require(fs.realpathSync(credential)))
        conversation.locale = locale
        conversation.screenSupport = screen !== "off"
        const interactive = new Interactive(conversation, level, screen, audio, output)
        return interactive
    }

    async _startSetup(secret: string, output: string): Promise<void> {
        const setup = this._createSetup(secret, output)
        await setup.start()
    }

    _createSetup(secret: string, output: string): Setup {
        return new Setup({
            secret,
            output,
        })
    }

    async _startAutopilot(input: string,
                          credential: string,
                          level: string,
                          screen: string,
                          audio: string,
                          output: string): Promise<void> {
        const autopilot = this._createAutopilot(input, credential, level, screen, audio, output)
        await autopilot.start()
    }

    _createAutopilot(input: string,
                     credential: string,
                     level: string,
                     screen: string,
                     audio: string,
                     output: string): Autopilot {
        const conversation = new Conversation(require(fs.realpathSync(credential)))
        conversation.screenSupport = screen !== "off"
        return new Autopilot(conversation, input, level, screen, audio, output)
    }

    _onFail(message: string): void {
        console.error(`Fail: ${message}`)
        process.exit(1)
    }

    _showHelp(def: yargs.Argv): void {
        def.showHelp()
    }

}
