import test from "ava"
import {Interactive} from "../interactive"
import * as sinon from "sinon"
import {Conversation, ConversationResponse} from "../conversation"

test("When the assistant immediately returns no response", async t => {
    const conversation = new Conversation(
        "en-US",
        require(__dirname + "/../../src/_test/test-credentials.json"),
    )
    const interactive = new Interactive(conversation,"full")
    const mockConversation = sinon.mock(interactive._conversation)
    mockConversation
        .expects("say")
        .withArgs("dummy")
        .callsFake((phrase: string) => {
            return new Promise<ConversationResponse>((resolve, reject) => {
                const conversationResponse: ConversationResponse = {
                    expectUserResponse: false,
                    displayText: [],
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
    const mockInteractive = sinon.mock(interactive)
    mockInteractive
        .expects("_output")
        .once()
        .withArgs(["Interactive mode started. If you want to exit, press Ctrl+C", ""])
    mockInteractive
        .expects("_output")
        .once()
        .withArgs(["", sinon.match.object, ""])
    mockInteractive
        .expects("_output")
        .once()
        .withArgs(["", "Conversation aborted: SIGINT"])
    mockInteractive
        .expects("_hear")
        .once()
        .returns(new Promise<string>((resolve, reject) => {
            resolve("dummy")
        }))
    mockInteractive
        .expects("_hear")
        .once()
        .returns(new Promise<string>((resolve, reject) => {
            reject("SIGINT")
        }))
    await interactive.start()
    mockInteractive.verify()
    mockConversation.verify()
    t.pass()
})
