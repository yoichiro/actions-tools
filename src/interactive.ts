import * as readline from "readline"
import {Conversation} from "./conversation"
import {AbstractCommand} from "./abstract-command"

export class Interactive extends AbstractCommand {

    constructor(conversation: Conversation, level: string) {
        super(conversation, level)
    }

    async start(): Promise<void> {
        this._output([
            "Interactive mode started. If you want to exit, press Ctrl+C",
            "",
        ])
        try {
            await this._dialogue()
        } catch(e) {
            try {
                await this._send("cancel")
            } catch(_) {
            }
            this._output([
                "",
                `Conversation aborted: ${e.toString()}`,
            ])
        }
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
            rl.question("> ", answer => {
                rl.close()
                resolve(answer)
            })
        })
    }

}
