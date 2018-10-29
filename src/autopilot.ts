import {Conversation} from "./conversation"
import * as fs from "fs"
import * as yaml from "js-yaml"
import {AbstractCommand} from "./abstract-command"
import {colors} from "./colors"

interface DialogDefinition {
    locale: string,
    dialogs: {
        phrase: string,
    }[],
}

export class Autopilot extends AbstractCommand {

    _input: any

    constructor(conversation: Conversation, input: string, level: string, screen: string, audio: string, output: string, rich: boolean) {
        super(conversation, level, screen, audio, output, rich)
        this._input = input
    }

    start(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            this._output([
                colors.system("Autopilot mode started.", "airplane_departure"),
                "",
            ])
            try {
                const definition = await this._loadInputFile(this._input)
                this._conversation.locale = definition.locale
                await this._dialogue(definition, 0)
                this._output([
                    colors.system("Autopilot mode finished.", "airplane_arriving"),
                ])
            } catch(e) {
                try {
                    await this._send("cancel")
                } catch(_) {
                }
                this._output([
                    "",
                    colors.system(`Conversation aborted: ${e.toString()}`, "sparkles"),
                ])
            }
            resolve()
        })
    }

    _dialogue(definition: DialogDefinition, index: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                if (index < definition.dialogs.length) {
                    const phrase = definition.dialogs[index].phrase
                    this._output([
                        `${colors.prompt("> ")}${phrase}`,
                    ])
                    const response = await this._send(phrase)
                    this._output([
                        "",
                        response,
                        "",
                    ])
                    await this._dialogue(definition, index + 1)
                } else {
                    try {
                        await this._send("cancel")
                    } catch(_) {
                    }
                }
                resolve()
            } catch(e) {
                reject(e)
            }
        })
    }

    async _loadInputFile(filePath: string): Promise<DialogDefinition> {
        return new Promise<DialogDefinition>((resolve, reject) => {
            fs.readFile(fs.realpathSync(filePath), {
                encoding: "utf8",
            }, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(yaml.safeLoad(data) as DialogDefinition)
                }
            })
        })
    }

}