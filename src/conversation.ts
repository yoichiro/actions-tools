import * as path from "path"
import {UserRefreshClient} from "google-auth-library"
import {
    AssistConfig, AssistRequest,
    AssistResponse,
    BasicCard,
    CarouselBrowse, ExpectedIntent,
    Item, LinkOutSuggestion,
    MediaResponse,
    RichResponse, Suggestion,
    TableCard,
} from "./conversation-protocol"
import * as te from "text-encoding"

const googleProtoFiles = require("google-proto-files")
const grpc = require("grpc")
const protoLoader = require("@grpc/proto-loader")

export interface TokenInfo {
    client_id: string,
    client_secret: string,
    refresh_token: string,
    type: string,
}

export interface ConversationResponse {
    displayText?: string[],
    deviceAction?: {
        [key: string]: any,
    },
    expectUserResponse?: boolean,
    textToSpeech?: string[],
    ssml?: string[],
    basicCards?: BasicCard[],
    carouselBrowses?: CarouselBrowse[],
    mediaResponses?: MediaResponse[],
    tableCards?: TableCard[],
    suggestions?: string[],
    linkOutSuggestion?: LinkOutSuggestion,
    possibleIntents?: ExpectedIntent[],
    responseMetadata?: any,
    screenOut?: {
        format: number,
        data: string,
    },
    audioOut?: Uint8Array[],
}

const packageDefinition = protoLoader.loadSync(
    path.relative(googleProtoFiles(".."), googleProtoFiles["embeddedAssistant"].v1alpha2),
    {
        keepCase: true,
        longs: String,
        // enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [
            googleProtoFiles(".."),
        ],
    },
)
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
const embeddedAssistantProtocolBuffer = protoDescriptor.google.assistant.embedded.v1alpha2

export class Conversation {

    _assistant: any
    _locale: string
    _previousConversationState: Uint8Array
    _screenSupport: boolean
    _newConversation: boolean

    constructor(
        tokenInfo: TokenInfo,
    ) {
        this.locale = "en-US"
        this._screenSupport = false
        this._newConversation = true
        this._assistant = this._createAssistant(tokenInfo)
    }

    set locale(locale: string) {
        this._locale = locale
    }

    set screenSupport(screenSupport: boolean) {
        this._screenSupport = screenSupport
    }

    _createAssistant(tokenInfo: TokenInfo) {
        let channelCredentials = grpc.credentials.createSsl()
        const userRefreshClient = new UserRefreshClient()
        userRefreshClient.fromJSON(tokenInfo)
        const googleCredential = grpc.credentials.createFromGoogleCredential(userRefreshClient)
        channelCredentials = grpc.credentials.combineChannelCredentials(channelCredentials, googleCredential)
        return new embeddedAssistantProtocolBuffer.EmbeddedAssistant(
            "embeddedassistant.googleapis.com",
            channelCredentials,
        )
    }

    say(userPhrase: string): Promise<ConversationResponse> {
        const assistConfig = this._createAssistConfig()
        this._setLocale(assistConfig, this._locale)
        this._setIsNewConversation(assistConfig, this._newConversation)
        this._newConversation = false
        this._setUserPhrase(assistConfig, userPhrase)
        const assistRequest = this._createAssistRequest(assistConfig)
        const conversation = this._assistant.assist()
        return new Promise((resolve, reject) => {
            const response: ConversationResponse = {
                // expectUserResponse: false,
            }
            conversation.on("data", (data: AssistResponse) => {
                this._onConversationData(data, response)
            })
            conversation.on("end", () => {
                this._onConversationEnd(response, resolve)
            })
            conversation.on("error", (error: Error) => {
                this._onConversationError(error, reject)
            })
            conversation.write(assistRequest)
            conversation.end()
        })
    }

    _onConversationData(data: AssistResponse, response: ConversationResponse): void {
        this._handleDialogStateOut(data, response)
        this._handleDeviceAction(data, response)
        this._handleDebugInfo(data, response)
        this._handleScreenOut(data, response)
        this._handleAudioOut(data, response)
    }

    _handleAudioOut(data: AssistResponse, response: ConversationResponse): void {
        if (data.audio_out) {
            if (!response.audioOut) {
                response.audioOut = [data.audio_out.audio_data]
            } else {
                response.audioOut.push(data.audio_out.audio_data)
            }
        }
    }

    _handleScreenOut(data: AssistResponse, response: ConversationResponse): void {
        if (data.screen_out) {
            if (data.screen_out.format === 1) { // HTML
                // const html = Buffer.from(data.screen_out.data!.buffer).toString()
                const html = new te.TextDecoder("utf-8").decode(data.screen_out.data!)
                response.screenOut = {
                    format: data.screen_out.format,
                    data: html,
                }
            }
        }
    }

    _handleDebugInfo(data: AssistResponse, response: ConversationResponse): void {
        if (data.debug_info) {
            const debugInfo = JSON.parse(data.debug_info.aog_agent_to_assistant_json)
            if (debugInfo.expectUserResponse) {
                response.expectUserResponse = debugInfo.expectUserResponse
            }
            const richResponse = this._getRichResponse(debugInfo)
            if (richResponse) {
                richResponse.items.forEach((item: Item) => {
                    this._handleSimpleResponse(item, response)
                    this._handleBasicCard(item, response)
                    this._handleCarouselBrowse(item, response)
                    this._handleMediaResponse(item, response)
                    this._handleTableCard(item, response)
                })
                this._handleSuggestions(richResponse, response)
                this._handleLinkOutSuggestion(richResponse, response)
            }
            this._handlePossibleIntents(debugInfo, response)
            if (debugInfo.responseMetadata) {
                response.responseMetadata = debugInfo.responseMetadata
            }
        }
    }

    _handlePossibleIntents(debugInfo: any, response: ConversationResponse): void {
        if (debugInfo.expectedInputs) {
            debugInfo.expectedInputs.forEach((expectedInput: any) => {
                if (response.possibleIntents) {
                    response.possibleIntents.concat(expectedInput.possibleIntents)
                } else {
                    response.possibleIntents = expectedInput.possibleIntents
                }
            })
        }
    }

    _handleLinkOutSuggestion(richResponse: RichResponse, response: ConversationResponse): void {
        if (richResponse.linkOutSuggestion) {
            response.linkOutSuggestion = richResponse.linkOutSuggestion
        }
    }

    _handleSuggestions(richResponse: RichResponse, response: ConversationResponse): void {
        if (richResponse.suggestions) {
            richResponse.suggestions.forEach((suggestion: Suggestion) => {
                if (!response.suggestions) {
                    response.suggestions = []
                }
                response.suggestions.push(suggestion.title)
            })
        }
    }

    _handleTableCard(item: Item, response: ConversationResponse): void {
        if (item.tableCard) {
            if (response.tableCards) {
                response.tableCards.push(item.tableCard)
            } else {
                response.tableCards = [item.tableCard]
            }
        }
    }

    _handleMediaResponse(item: Item, response: ConversationResponse): void {
        if (item.mediaResponse) {
            if (response.mediaResponses) {
                response.mediaResponses.push(item.mediaResponse)
            } else {
                response.mediaResponses = [item.mediaResponse]
            }
        }
    }

    _handleCarouselBrowse(item: Item, response: ConversationResponse): void {
        if (item.carouselBrowse) {
            if (response.carouselBrowses) {
                response.carouselBrowses.push(item.carouselBrowse)
            } else {
                response.carouselBrowses = [item.carouselBrowse]
            }
        }
    }

    _handleBasicCard(item: Item, response: ConversationResponse): void {
        if (item.basicCard) {
            if (response.basicCards) {
                response.basicCards.push(item.basicCard)
            } else {
                response.basicCards = [item.basicCard]
            }
        }
    }

    _handleSimpleResponse(item: Item, response: ConversationResponse): void {
        if (item.simpleResponse) {
            if (item.simpleResponse.textToSpeech) {
                if (response.textToSpeech) {
                    response.textToSpeech.push(item.simpleResponse.textToSpeech)
                } else {
                    response.textToSpeech = [item.simpleResponse.textToSpeech]
                }
            }
            if (item.simpleResponse.displayText) {
                if (response.displayText) {
                    response.displayText.push(item.simpleResponse.displayText)
                } else {
                    response.displayText = [item.simpleResponse.displayText]
                }
            }
            if (item.simpleResponse.ssml) {
                if (response.ssml) {
                    response.ssml.push(item.simpleResponse.ssml)
                } else {
                    response.ssml = [item.simpleResponse.ssml]
                }
            }
        }
    }

    _getRichResponse(debugInfo: any): RichResponse | undefined {
        if (debugInfo.expectedInputs) {
            return debugInfo.expectedInputs[0].inputPrompt.richInitialPrompt
        } else if (debugInfo.finalResponse) {
            return debugInfo.finalResponse.richResponse
        } else {
            return undefined
        }
    }

    _handleDeviceAction(data: AssistResponse, response: ConversationResponse): void {
        if (data.device_action) {
            const deviceRequestJson = data.device_action.device_request_json
            if (deviceRequestJson) {
                response.deviceAction = JSON.parse(deviceRequestJson)
            }
        }
    }

    _handleDialogStateOut(data: AssistResponse, response: ConversationResponse): void {
        if (data.dialog_state_out) {
            this._previousConversationState = data.dialog_state_out.conversation_state
            const supplementDisplayText = data.dialog_state_out.supplemental_display_text
            if (supplementDisplayText && !response.displayText) {
                response.displayText = [
                    supplementDisplayText,
                ]
            }
        }
    }

    _onConversationError(error: Error, reject: any): void {
        console.error(error.message)
        reject(error)
    }

    _onConversationEnd(response: ConversationResponse, resolve: any): void {
        resolve(response)
    }

    _createAssistRequest(config: AssistConfig): AssistRequest {
        const assistRequest: AssistRequest = {
            config,
        }
        delete assistRequest.audio_in
        return assistRequest
    }

    _setUserPhrase(config: AssistConfig, userPhrase: string): void {
        config.text_query = userPhrase
    }

    _setIsNewConversation(config: AssistConfig, isNewConversation: boolean): void {
        if (!config.dialog_state_in) {
            config.dialog_state_in = {}
        }
        config.dialog_state_in.is_new_conversation = isNewConversation
    }

    _setLocale(config: AssistConfig, locale: string): void {
        if (!config.dialog_state_in) {
            config.dialog_state_in = {}
        }
        config.dialog_state_in.language_code = locale
    }

    _createAssistConfig(): AssistConfig {
        const config: AssistConfig = {}
        this._configureAudioOutConfig(config)
        this._configureDialogStateIn(config)
        this._configureDeviceConfig(config)
        this._configureDebugConfig(config)
        this._configureScreenConfig(config)
        return config
    }

    _configureScreenConfig(config: AssistConfig): void {
        if (this._screenSupport) {
            config.screen_out_config = {
                screen_mode: 3, // PLAYING
            }
        }
    }

    _configureDebugConfig(config: AssistConfig): void {
        config.debug_config = {
            return_debug_info: true,
        }
    }

    _configureDeviceConfig(config: AssistConfig): void {
        config.device_config = {
            device_id: "default",
            device_model_id: "default",
        }
    }

    _configureDialogStateIn(config: AssistConfig): void {
        config.dialog_state_in = {}
        if (this._previousConversationState) {
            config.dialog_state_in.conversation_state = this._previousConversationState
        }
    }

    _configureAudioOutConfig(config: AssistConfig): void {
        config.audio_out_config = {
            encoding: 2, // MP3
            sample_rate_hertz: 16000,
            volume_percentage: 100,
        }
    }

}