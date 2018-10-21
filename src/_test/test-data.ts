export const BASIC_ASSISTANT_RESPONSE = {
    expectUserResponse: true,
    expectedInputs: [
        {
            inputPrompt: {
                richInitialPrompt: {
                    items: [
                        {
                            simpleResponse: {
                                textToSpeech: "<speak>The decimal number 123 is a <say-as interpret-as=\"characters\">7b</say-as> hexadecimal number.The hexadecimal number <say-as interpret-as=\"characters\">123</say-as> is a 291 decimal number.Please tell me other number you want to know.</speak>",
                                displayText: "The decimal number 123 is a 7b hexadecimal number.The hexadecimal number 123 is a 291 decimal number.Please tell me other number you want to know.",
                            },
                        },
                        {
                            basicCard: {
                            },
                        },
                        {
                            carouselBrowse: {
                            },
                        },
                        {
                            mediaResponse: {
                            },
                        },
                        {
                            tableCard: {
                            },
                        },
                    ],
                    suggestions: [
                        {
                            title: "suggestion1",
                        },
                        {
                            title: "suggestion2",
                        },
                    ],
                    linkOutSuggestion: {
                        destinationName: "destinationName1",
                        url: "url1",
                    },
                },
            },
            possibleIntents: [
                {
                    intent: "actions.intent.TEXT",
                },
            ],
        },
    ],
}

export const BASIC_CONVERSATION_RESPONSE = {
    expectUserResponse: true,
    textToSpeech: [
        "<speak>The decimal number 123 is a <say-as interpret-as=\"characters\">7b</say-as> hexadecimal number.The hexadecimal number <say-as interpret-as=\"characters\">123</say-as> is a 291 decimal number.Please tell me other number you want to know.</speak>",
    ],
    displayText: [
        "The decimal number 123 is a 7b hexadecimal number.The hexadecimal number 123 is a 291 decimal number.Please tell me other number you want to know.",
    ],
    suggestions: [
        "suggestion1",
        "suggestion2",
    ],
    linkOutSuggestion: {
        destinationName: "destinationName1",
        url: "url1",
    },
    basicCards: [
        {},
    ],
    carouselBrowses: [
        {},
    ],
    mediaResponses: [
        {},
    ],
    tableCards: [
        {},
    ],
    possibleIntents: [
        {
            intent: "actions.intent.TEXT",
        },
    ],
}
