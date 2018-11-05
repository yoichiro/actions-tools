import test from "ava"
import * as sinon from "sinon"
import {Conversation} from "../conversation"
import {Testing} from "../testing"

test("Launch the Mocha", async t => {
    const conversation = new Conversation(
        require(__dirname + "/../../src/_test/test-credentials.json"),
    )
    conversation.locale = "en-US"
    const testing = Testing.createInstance(conversation, "target1", "report1")
    t.is(testing, Testing.getInstance())
    t.is(conversation, Testing.getConversation())
    const mocha = {
        run: () => {},
    }
    const runMock = sinon.mock(mocha)
    runMock
        .expects("run")
        .withArgs(sinon.match.func)
        .callsFake(callback => {
            callback(false)
        })
    const createMochaMock = sinon.mock(testing)
    createMochaMock
        .expects("_createMocha")
        .returns(mocha)
    const setupFilesMock = sinon.mock(testing)
    setupFilesMock
        .expects("_setupFiles")
        .withArgs(mocha)
    const result = await testing.start()
    t.is(result, 0)
    runMock.verify()
    createMochaMock.verify()
    setupFilesMock.verify()
})