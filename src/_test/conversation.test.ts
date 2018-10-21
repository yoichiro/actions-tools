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

const createAssistantMock = (data: any) => {
    const response = {
        debug_info: {
            aog_agent_to_assistant_json: JSON.stringify(data),
        },
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
    const action = new Conversation("en-US", tokenInfo)
    const mockResponse = sinon.stub(action._assistant, "assist")
    mockResponse.callsFake(() => {
        const conversation = createAssistantMock(TestData.BASIC_ASSISTANT_RESPONSE)
        return conversation
    })

    return action.say("")
        .then((response: ConversationResponse) => {
            t.deepEqual(response, TestData.BASIC_CONVERSATION_RESPONSE)
            mockResponse.restore()
        })
})
