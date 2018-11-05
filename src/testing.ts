import {Conversation} from "./conversation"
import * as path from "path"
import * as fs from "fs"

const Mocha = require("mocha")

export class Testing {

    static _instance: Testing

    _target: string
    _conversation: Conversation
    _report: string

    constructor(conversation: Conversation, target: string, report: string) {
        this._conversation = conversation
        this._target = target
        this._report = report
    }

    static createInstance(conversation: Conversation, target: string, report: string): Testing {
        if (!Testing._instance) {
            Testing._instance = new Testing(conversation, target, report)
        }
        return Testing._instance
    }

    static getInstance(): Testing {
        return Testing._instance
    }

    async start(): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            try {
                const mocha = this._createMocha()
                this._setupFiles(mocha)
                mocha.run((failures: any) => {
                    resolve(failures ? 1 : 0)
                })
            } catch(e) {
                console.error(e)
                resolve(1)
            }
        })
    }

    _createMocha(): any {
        return new Mocha({
            timeout: 10000,
            reporter: this._report,
        })
    }

    _setupFiles(mocha: any): void {
        const resolvedPath = path.resolve(this._target)
        if (fs.statSync(resolvedPath).isDirectory()) {
            fs.readdirSync(resolvedPath).filter(path => {
                return path.endsWith("test.js")
            }).forEach(path => {
                mocha.addFile(path)
            })
        } else {
            mocha.addFile(resolvedPath)
        }
    }

    static getConversation(): Conversation {
        return Testing.getInstance()._conversation
    }

}
