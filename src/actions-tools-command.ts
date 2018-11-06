import * as yargs from "yargs"
import {Interactive} from "./interactive"
import {Setup} from "./setup"
import {Conversation} from "./conversation"
import * as fs from "fs"
import {Autopilot} from "./autopilot"
import {Testing} from "./testing"
import * as os from "os"
import * as path from "path"

export class ActionsToolsCommand {

    main(): void {
        const def = this._createArgumentsDefinition()
        const args = def.argv
        const isValidCommandName = ["interactive", "setup", "autopilot", "test"].some((x: string): boolean => {
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
                    .option("rich", {
                        alias: "r",
                        description: "Rich output (color and emoji)",
                        default: true,
                        type: "boolean",
                    })
            }, async (args: yargs.Arguments) => {
                await this._startInteraction(
                    args.locale,
                    args.level,
                    args.screen,
                    args.audio,
                    args.output,
                    args.rich,
                    args.credential,
                )
                this._exit(0)
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
                    .option("rich", {
                        alias: "r",
                        description: "Rich output (color and emoji)",
                        default: true,
                        type: "boolean",
                    })
            }, async (args: yargs.Arguments) => {
                await this._startAutopilot(
                    args.input,
                    args.level,
                    args.screen,
                    args.audio,
                    args.output,
                    args.rich,
                    args.credential,
                )
                this._exit(0)
            })
            .command("test", "Test mode", (yargs: yargs.Argv) => {
                return yargs
                    .usage("Usage: actions-tools test [Options]")
                    .example("actions-tests test",
                        "")
                    .option("credential", {
                        alias: "c",
                        description: "Your credential file path",
                        type: "string",
                    })
                    .option("locale", {
                        alias: "l",
                        description: "Locale string",
                        default: "en-US",
                        type: "string",
                    })
                    .option("input", {
                        alias: "i",
                        description: "The directory or file path of the test target",
                        default: "./",
                        type: "string",
                    })
                    .option("report", {
                        alias: "r",
                        description: "Report format",
                        default: "spec",
                        type: "string",
                    })
            }, async (args: yargs.Arguments) => {
                const exitCode = await this._startTesting(
                    args.locale,
                    args.input,
                    args.report,
                    args.credential,
                )
                this._exit(exitCode)
            })
            .fail((msg: string, err: Error) => {
                this._onFail(msg || err.message)
            })
            .version(false)
            .help()
            .wrap(yargs.terminalWidth())
    }

    _exit(code: number): void {
        process.exit(code)
    }

    async _startSetup(secret: string, output?: string): Promise<void> {
        const setup = this._createSetup(secret, output)
        await setup.start()
    }

    _createSetup(secret: string, output?: string): Setup {
        return new Setup({
            secret,
            output,
        })
    }

    async _startInteraction(locale: string,
                            level: string,
                            screen: string,
                            audio: string,
                            output: string,
                            rich: boolean,
                            credential?: string): Promise<void> {
        const interactive = this._createInteractive(locale, level, screen, audio, output, rich, credential)
        await interactive.start()
    }

    _createInteractive(locale: string,
                       level: string,
                       screen: string,
                       audio: string,
                       output: string,
                       rich: boolean,
                       credential?: string): Interactive {
        const conversation = new Conversation(require(this._createCredentialFilePath(credential)))
        conversation.locale = locale
        conversation.screenSupport = screen !== "off"
        const interactive = new Interactive(conversation, level, screen, audio, output, rich)
        return interactive
    }

    _createCredentialFilePath(credential?: string): string {
        if (credential) {
            return fs.realpathSync(credential)
        } else {
            return path.join(os.homedir(), ".actions-tools", "credentials.json")
        }
    }

    async _startAutopilot(input: string,
                          level: string,
                          screen: string,
                          audio: string,
                          output: string,
                          rich: boolean,
                          credential?: string): Promise<void> {
        const autopilot = this._createAutopilot(input, level, screen, audio, output, rich, credential)
        await autopilot.start()
    }

    _createAutopilot(input: string,
                     level: string,
                     screen: string,
                     audio: string,
                     output: string,
                     rich: boolean,
                     credential?: string): Autopilot {
        const conversation = new Conversation(require(this._createCredentialFilePath(credential)))
        conversation.screenSupport = screen !== "off"
        return new Autopilot(conversation, input, level, screen, audio, output, rich)
    }

    async _startTesting(locale: string,
                        input: string,
                        report: string,
                        credential?: string): Promise<number> {
        const testing = this._createTesting(locale, input, report, credential)
        return await testing.start()
    }

    _createTesting(locale: string,
                   input: string,
                   report: string,
                   credential?: string): Testing {
        const conversation = new Conversation(require(this._createCredentialFilePath(credential)))
        conversation.locale = locale
        return Testing.createInstance(conversation, input, report)
    }

    _onFail(message: string): void {
        console.error(`Fail: ${message}`)
        process.exit(1)
    }

    _showHelp(def: yargs.Argv): void {
        def.showHelp()
    }

}
