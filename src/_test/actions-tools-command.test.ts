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
        .withArgs("ja-JP", "debug", "off", "play", "./path1", true, "./credentials1.json")
        .returns(interactive)
    const exitStub = sinon.stub(subject, "_exit")
    exitStub
        .callsFake(() => {
        })

    process.argv = [
        "node", "main.js",
        "interactive",
        "--locale", "ja-JP",
        "--credential", "./credentials1.json",
        "--level", "debug",
        "--screen", "off",
        "--audio", "play",
        "--output", "./path1",
        "--rich", "true",
    ]

    subject.main()

    subjectMock.verify()
    t.is(interactiveSpy.calledOnce, true)
})

test("When autopilot specified", t => {
    const subject = new ActionsToolsCommand()

    const autopilot = {start: () => {}}
    const autopilotSpy = sinon.spy(autopilot, "start")
    const subjectMock = sinon.mock(subject)
    subjectMock
        .expects("_createAutopilot")
        .withArgs("./input1.yml", "debug", "play", "file", "./path1", true, "./credentials1.json")
        .returns(autopilot)
    const exitStub = sinon.stub(subject, "_exit")
    exitStub
        .callsFake(() => {
        })

    process.argv = [
        "node", "main.js",
        "autopilot",
        "--input", "./input1.yml",
        "--credential", "./credentials1.json",
        "--level", "debug",
        "--screen", "play",
        "--audio", "file",
        "--output", "./path1",
        "--rich", "true",
    ]

    subject.main()

    subjectMock.verify()
    t.is(autopilotSpy.calledOnce, true)
})

test("When test specified", t => {
    const subject = new ActionsToolsCommand()

    const testing = {start: () => {}}
    const testingSpy = sinon.spy(testing, "start")
    const subjectMock = sinon.mock(subject)
    subjectMock
        .expects("_createTesting")
        .withArgs("ja-JP", "./tests", "spec", "./credentials1.json")
        .returns(testing)
    const exitStub = sinon.stub(subject, "_exit")
    exitStub
        .callsFake(() => {
        })

    process.argv = [
        "node", "main.js",
        "test",
        "--input", "./tests",
        "--credential", "./credentials1.json",
        "--locale", "ja-JP",
        "--report", "spec",
    ]

    subject.main()

    subjectMock.verify()
    t.is(testingSpy.calledOnce, true)
})
