import test from "ava"
import * as sinon from "sinon"
import {Conversation, ConversationResponse, TokenInfo} from "../conversation"
import * as TestData from "./test-data"

const tokenInfo: TokenInfo = {
    client_id: "clientId1",
    client_secret: "clientSecret1",
    refresh_token: "refreshToken1",
    type: "authorized_user",
}

const createAssistantMock = (data: {
    debug: any,
    screenOut: any,
}) => {
    const response = {
        debug_info: {
            aog_agent_to_assistant_json: JSON.stringify(data.debug),
        },
        screen_out: data.screenOut,
    }
    let onData: Function, onEnd: Function
    return {
        on: (eventName: string, callback: Function) => {
            if (eventName === "data") {
                onData = callback
            } else if (eventName === "end") {
                onEnd = callback
            }
        },
        write: (data: any) => {
        },
        end() {
            onData(response)
            onEnd()
        },
    }
}

test.serial("Simple dialog", t => {
    const conversation = new Conversation(tokenInfo)
    conversation.locale = "en-US"
    conversation.screenSupport = true
    const mockResponse = sinon.stub(conversation._assistant, "assist")
    mockResponse.callsFake(() => {
        const conversation = createAssistantMock({
            debug: TestData.BASIC_ASSISTANT_RESPONSE,
            screenOut: {
                format: 1,
                data: Uint8Array.from(Buffer.from("abc123")),
            },
        })
        return conversation
    })

    return conversation.say("")
        .then((response: ConversationResponse) => {
            t.deepEqual(response, TestData.BASIC_CONVERSATION_RESPONSE)
            mockResponse.restore()
        })
})
