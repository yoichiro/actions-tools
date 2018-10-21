import test from "ava"
import * as sinon from "sinon"
import {ActionsToolsCommand} from "../actions-tools-command"

test("When any arguments not specified", t => {
    const subject = new ActionsToolsCommand()

    const subjectMock = sinon.mock(subject)
    subjectMock
        .expects("_showHelp")
        .once()

    process.argv = ["node", "main.js"]

    subject.main()

    subjectMock.verify()
    t.pass()
})

test("When setup specified", t => {
    const subject = new ActionsToolsCommand()

    const setup = {start: () => {}}
    const setupSpy = sinon.spy(setup, "start")
    const subjectMock = sinon.mock(subject)
    subjectMock
        .expects("_createSetup")
        .withArgs("./secret1.json", "./credentials1.json")
        .returns(setup)

    process.argv = ["node", "main.js", "setup", "--secret", "./secret1.json", "--output", "./credentials1.json"]

    subject.main()

    subjectMock.verify()
    t.is(setupSpy.calledOnce, true)
})

test("When interactive specified", t => {
    const subject = new ActionsToolsCommand()

    const interactive = {start: () => {}}
    const interactiveSpy = sinon.spy(interactive, "start")
    const subjectMock = sinon.mock(subject)
    subjectMock
        .expects("_createInteractive")
        .withArgs("./credentials1.json", "ja-JP", "debug")
        .returns(interactive)

    process.argv = ["node", "main.js", "interactive", "--locale", "ja-JP", "--credential", "./credentials1.json", "--level", "debug"]

    subject.main()

    subjectMock.verify()
    t.is(interactiveSpy.calledOnce, true)
})
