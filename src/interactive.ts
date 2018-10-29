import * as readline from "readline"
import {Conversation} from "./conversation"
import {AbstractCommand} from "./abstract-command"
import {colors} from "./colors"

export class Interactive extends AbstractCommand {

    constructor(conversation: Conversation, level: string, screen: string, audio: string, output: string, rich: boolean) {
        super(conversation, level, screen, audio, output, rich)
    }

    async start(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            this._output([
                colors.system("Interactive mode started. If you want to exit, press Ctrl+C", "speaker"),
                "",
            ])
            try {
                await this._dialogue()
            } catch(e) {
                try {
                    await this._send("cancel")
                } catch (_) {
                }
                this._output([
                    "",
                    colors.system(`Conversation aborted: ${e.toString()}`, "sparkles"),
                ])
            }
            resolve()
        })
    }

    async _dialogue(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                let phrase = undefined
                while (!phrase || phrase.length === 0) {
                    phrase = await this._hear()
                }
                const response = await this._send(phrase)
                this._output([
                    "",
                    response,
                    "",
                ])
                await this._dialogue()
                resolve()
            } catch(e) {
                reject(e)
            }
        })
    }

    async _hear(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            })
            rl.on("SIGINT", () => {
                rl.close()
                console.log("")
                reject("SIGINT")
            })
            rl.question(colors.prompt("> "), answer => {
                rl.close()
                resolve(answer)
            })
        })
    }

}
