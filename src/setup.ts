import * as fs from "fs"
import * as readline from "readline"
import {OAuth2Client} from "google-auth-library"
import * as os from "os"
import * as makeDir from "make-dir"
import * as path from "path"


interface ClientSecretFile {
    installed: {
        [key: string]: string | string[];
    },
}

interface TokenInfo {
    client_id: string,
    client_secret: string,
    refresh_token: string,
    type: string,
}

export class Setup {

    constructor(private params: {
        secret: string,
        output?: string,
    }) {
    }

    start(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const secretFilePath = this.params.secret
            try {
                const clientSecretData = await this._readClientSecretFile(secretFilePath)
                const oauth2Client = this._createOAuth2Client(clientSecretData)
                console.log("Go to the following URL to authorize in your Web browser, then paste the code below:")
                const authUrl = this._generateAuthUrl(oauth2Client)
                console.log(authUrl)
                const authorizationCode = await this._readAuthorizationCode()
                const tokenInfo = await this._getToken(oauth2Client, authorizationCode, clientSecretData)
                let outputFilePath = this.params.output
                if (!outputFilePath) {
                    const parentDir = path.join(os.homedir(), ".actions-tools")
                    makeDir.sync(parentDir)
                    outputFilePath = path.join(parentDir, "credentials.json")
                }
                await this._createCredentialFile(tokenInfo, outputFilePath)
            } catch(e) {
                console.error(e.message)
            }
            resolve()
        })
    }

    _createCredentialFile(tokenInfo: TokenInfo, outputFilePath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(outputFilePath, JSON.stringify(tokenInfo), {
                encoding: "utf8",
            }, err => {
                if (err) {
                    reject(`Error: Cannot create your credential file. ${err.message}`)
                } else {
                    console.log(`Your credential file created. ${outputFilePath}`)
                    resolve()
                }
            })
        })
    }

    _getToken(oauth2Client: OAuth2Client, authorizationCode: string, clientSecretData: ClientSecretFile): Promise<TokenInfo> {
        return new Promise<TokenInfo>((resolve, reject) => {
            oauth2Client.getToken(authorizationCode, (err, tokens) => {
                if (err) {
                    reject(err)
                } else {
                    resolve({
                        client_id: clientSecretData.installed["client_id"] as string,
                        client_secret: clientSecretData.installed["client_secret"] as string,
                        refresh_token: tokens!["refresh_token"]!,
                        type: "authorized_user",
                    })
                }
            })
        })
    }

    _readAuthorizationCode(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            })
            rl.question("Authorization code: ", (answer: string) => {
                rl.close()
                resolve(answer)
            })
        })
    }

    _generateAuthUrl(client: OAuth2Client): string {
        return client.generateAuthUrl({
            access_type: "offline",
            scope: "https://www.googleapis.com/auth/assistant-sdk-prototype",
        })
    }

    _createOAuth2Client(clientSecretData: ClientSecretFile): OAuth2Client {
        return new OAuth2Client(
            clientSecretData.installed["client_id"] as string,
            clientSecretData.installed["client_secret"] as string,
            clientSecretData.installed["redirect_uris"][0],
        )
    }

    _readClientSecretFile(filePath: string): Promise<ClientSecretFile> {
        return new Promise<ClientSecretFile>((resolve, reject) => {
            fs.readFile(filePath, {
                encoding: "utf8",
            }, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(JSON.parse(data) as ClientSecretFile)
                }
            })
        })
    }

}
