import chalk from "chalk"
import * as emoji from "node-emoji"


class Colors {

    _applyColor: boolean

    constructor() {
        this.applyColor = true
    }

    set applyColor(applyColor: boolean) {
        this._applyColor = applyColor
    }

    system(message: string, emojiKey?: string): string {
        if (this._applyColor) {
            if (emojiKey) {
                return `${emoji.get(emojiKey)} ${chalk.gray(message)}`
            } else {
                return chalk.gray(message)
            }
        } else {
            return message
        }
    }

    prompt(message: string): string {
        if (this._applyColor) {
            return chalk.green(message)
        } else {
            return message
        }
    }

}

export const colors = new Colors()
