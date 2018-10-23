import {Conversation, ConversationResponse} from "./conversation"
import * as ora from "ora"

export abstract class AbstractCommand {

    _conversation: Conversation
    _level: string

    protected constructor(conversation: Conversation, level: string) {
        this._conversation = conversation
        this._level = level
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