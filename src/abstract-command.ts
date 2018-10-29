import {Conversation, ConversationResponse} from "./conversation"
import * as ora from "ora"
import * as fs from "fs"
import * as path from "path"
import * as stringifyObject from "stringify-object"
import {colors} from "./colors"

const opn = require("opn")
const player = require("play-sound")()

export abstract class AbstractCommand {

    _conversation: Conversation
    _level: string
    _screen: string
    _audio: string
    _outputDirectory: string

    protected constructor(conversation: Conversation, level: string, screen: string, audio: string, output: string, rich: boolean) {
        this._conversation = conversation
        this._level = level
        this._screen = screen
        this._audio = audio
        this._outputDirectory = output
        colors.applyColor = rich
    }

    _outputAsText(message: string | ConversationResponse): void {
        if (message instanceof Object && this._level === "simple") {
            const displayText = (message as ConversationResponse).displayText
            if (displayText) {
                displayText.forEach((text: string) => {
                    console.log(text)
                })
            } else {
                console.log(colors.system("(no response)"))
            }
        } else {
            if (message instanceof Object) {
                console.log(stringifyObject(message, {
                    indent: "  ",
                    singleQuotes: false,
                    transform: (obj: any, prop, originalResult): string => {
                        if (prop === "audioOut") {
                            if (obj["audioOut"]) {
                                const totalLength = obj.audioOut
                                    .map((x: any) => {
                                        return x.length
                                    }).reduce((a: any, c: any) => {
                                        return a + c
                                    }, 0)
                                return colors.system(`(${totalLength} bytes)`)
                            } else {
                                return colors.system("(empty)")
                            }
                        }
                        if (prop === "data") {
                            if (obj) {
                                return colors.system(`(${obj["data"].length} characters)`)
                            } else {
                                return colors.system(`(empty)`)
                            }
                        }
                        return originalResult
                    },
                }))
            } else {
                console.log(message)
            }
        }
    }

    _outputScreen(message: string | ConversationResponse): void {
        if (message instanceof Object && this._screen !== "off") {
            const screenOut = (message as ConversationResponse).screenOut
            if (screenOut) {
                if (this._screen === "file" || this._screen === "play") {
                    const filename = path.join(this._outputDirectory, `actions-tools-${Date.now()}.html`)
                    fs.writeFileSync(filename, screenOut.data)
                    console.log("")
                    console.log(colors.system(`The HTML file of the screen_out.data created. ${filename}`, "tv"))
                    if (this._screen === "play") {
                        opn(filename)
                    }
                }
            }
        }
    }

    _outputAudio(message: string | ConversationResponse): void {
        if (message instanceof Object && this._audio !== "off") {
            const audioOut = (message as ConversationResponse).audioOut
            if (audioOut) {
                if (this._audio === "file" || this._audio === "play") {
                    const filename = path.join(this._outputDirectory, `actions-tools-${Date.now()}.mp3`)
                    audioOut.forEach((audioData, i) => {
                        if (i === 0) {
                            fs.writeFileSync(filename, audioData)
                        } else {
                            fs.appendFileSync(filename, audioData)
                        }
                    })
                    console.log("")
                    console.log(colors.system(`The MP3 file of the audio_out.audio_data created. ${filename}`, "mega"))
                    if (this._audio === "play") {
                        player.play(filename, (err: any) => {
                            if (err) {
                                console.log(err)
                            }
                        })
                    }
                }
            }
        }
    }

    _output(messages: (string | ConversationResponse)[]): void {
        messages.forEach((message: string | ConversationResponse) => {
            this._outputAsText(message)
            this._outputScreen(message)
            this._outputAudio(message)
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