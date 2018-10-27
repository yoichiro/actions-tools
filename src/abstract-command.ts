import {Conversation, ConversationResponse} from "./conversation"
import * as ora from "ora"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"

const opn = require("opn")

export abstract class AbstractCommand {

    _conversation: Conversation
    _level: string
    _screen: string
    _screenOutput: string

    protected constructor(conversation: Conversation, level: string, screen: string, screenOutput: string) {
        this._conversation = conversation
        this._level = level
        this._screen = screen
        this._screenOutput = screenOutput
    }

    _output(messages: (string | ConversationResponse)[]): void {
        messages.forEach((message: string | ConversationResponse) => {
            if (message instanceof Object && this._level === "simple") {
                const displayText = (message as ConversationResponse).displayText
                if (displayText) {
                    displayText.forEach((text: string) => {
                        console.log(text)
                    })
                } else {
                    console.log("(no response)")
                }
                if (this._screen !== "off") {
                    const screenOut = (message as ConversationResponse).screenOut
                    if (screenOut) {
                        if (this._screen === "open" || this._screen === "full") {
                            const filename = path.join(os.tmpdir(), "__actions_tools_screen_out_data.html")
                            fs.writeFileSync(filename, screenOut.data)
                            opn(filename)
                        }
                        if (this._screen === "file" || this._screen === "full") {
                            const filename = path.join(this._screenOutput, `actions-tools-${Date.now()}.html`)
                            fs.writeFileSync(filename, screenOut.data)
                            console.log(`(The HTML file of the screen_out.data created. ${filename})`)
                        }
                    }
                }
            } else {
                console.log(message)
            }
        })
    }

    async _send(phrase: string): Promise<ConversationResponse> {
        return new Promise<ConversationResponse>(async (resolve, reject) => {
            const spinner = ora({
                color: "white",
            }).start()
            try {
                const response = await this._conversation.say(phrase)
                resolve(response)
            } catch(e) {
                reject(e)
            } finally {
                spinner.stop()
            }
        })
    }

}