import * as fs from "fs"
import * as readline from "readline"
import {Conversation, ConversationResponse} from "./conversation"

export class Interactive {

    _conversation: Conversation

    constructor(
        private params: {
            credential: string,
            locale: string,
            level: string,
        }) {
        this._conversation = this._createConversation(this.params.credential, this.params.locale)
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

    _createConversation(credential: string, locale: string): Conversation {
        return new Conversation(locale, require(fs.realpathSync(credential)))
    }

    _output(messages: (string | ConversationResponse)[]): void {
        messages.forEach((message: string | ConversationResponse) => {
            if (message instanceof Object && this.params.level === "simple") {
                const displayText = (message as ConversationResponse).displayText
                if (displayText) {
                    displayText.forEach((text: string) => {
                        console.log(text)
                    })
                } else {
                    console.log("(no response)")
                }
            } else {
                console.log(message)
            }
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
            rl.question("> ", answer => {
                rl.close()
                resolve(answer)
            })
        })
    }

    async _send(phrase: string): Promise<ConversationResponse> {
        return new Promise<ConversationResponse>(async (resolve, reject) => {
            try {
                resolve(await this._conversation.say(phrase))
            } catch(e) {
                reject(e)
            }
        })
    }

}
