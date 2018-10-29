import test from "ava"
import {Autopilot} from "../autopilot"
import * as sinon from "sinon"
import {Conversation, ConversationResponse} from "../conversation"

test("When the assistant immediately returns no response", async t => {
    const conversation = new Conversation(
        require(__dirname + "/../../src/_test/test-credentials.json"),
    )
    conversation.locale = "en-US"
    const autopilot = new Autopilot(
        conversation,
        __dirname + "/../../src/_test/test-autopilot.yml",
        "simple",
        "play",
        "file",
        "./path1",
        false)
    const mockConversation = sinon.mock(autopilot._conversation)
    mockConversation
        .expects("say")
        .withArgs("Hello")
        .callsFake((phrase: string) => {
            return new Promise<ConversationResponse>((resolve, reject) => {
                const conversationResponse: ConversationResponse = {
                    expectUserResponse: false,
                    displayText: [
                        "Hello, Yoichiro!",
                    ],
                }
                resolve(conversationResponse)
            })
        })
    mockConversation
        .expects("say")
        .withArgs("How is the weather today?")
        .callsFake((phrase: string) => {
            return new Promise<ConversationResponse>((resolve, reject) => {
                const conversationResponse: ConversationResponse = {
                    expectUserResponse: false,
                    displayText: [
                        "Fine. It will be max 25 degree.",
                    ],
                }
                resolve(conversationResponse)
            })
        })
    mockConversation
        .expects("say")
        .withArgs("cancel")
        .callsFake((phrase: string) => {
            return new Promise<ConversationResponse>((resolve, reject) => {
                const conversationResponse: ConversationResponse = {
                    expectUserResponse: false,
                    displayText: [],
                }
                resolve(conversationResponse)
            })
        })
    const mockAutopilot = sinon.mock(autopilot)
    mockAutopilot
        .expects("_output")
        .once()
        .withArgs(["Autopilot mode started.", ""])
    mockAutopilot
        .expects("_output")
        .once()
        .withArgs(["> Hello"])
    mockAutopilot
        .expects("_output")
        .once()
        .withArgs(["", sinon.match.object, ""])
    mockAutopilot
        .expects("_output")
        .once()
        .withArgs(["> How is the weather today?"])
    mockAutopilot
        .expects("_output")
        .once()
        .withArgs(["", sinon.match.object, ""])
    mockAutopilot
        .expects("_output")
        .once()
        .withArgs(["Autopilot mode finished."])
    await autopilot.start()
    mockAutopilot.verify()
    mockConversation.verify()
    t.pass()
})
