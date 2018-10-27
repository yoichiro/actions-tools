export interface AssistConfig {
    audio_in_config?: AudioInConfig,
    text_query?: string,
    audio_out_config?: AudioOutConfig,
    screen_out_config?: ScreenOutConfig,
    dialog_state_in?: DialogStateIn,
    device_config?: DeviceConfig,
    debug_config?: DebugConfig,
}

export interface AudioInConfig {
    encoding?: number,
    sample_rate_hertz?: number,
}

export interface AudioOutConfig {
    encoding?: number,
    sample_rate_hertz?: number,
    volume_percentage?: number,
}

export interface ScreenOutConfig {
    screen_mode?: number,
}

export interface DialogStateIn {
    conversation_state?: Uint8Array,
    language_code?: string,
    is_new_conversation?: boolean,
}

export interface DeviceConfig {
    device_id?: string,
    device_model_id?: string,
}

export interface DebugConfig {
    return_debug_info?: boolean,
}

export interface AssistRequest {
    config?: AssistConfig,
    audio_in?: Uint8Array,
}

export interface AssistResponse {
    event_type?: number,
    audio_out?: {
        audio_data: Uint8Array,
    },
    screen_out?: {
        format?: number,
        data?: Uint8Array,
    },
    device_action?: {
        device_request_json?: string,
    },
    speech_results?: [{
        transcript?: string,
        stability?: number,
    }],
    dialog_state_out?: {
        supplemental_display_text?: string,
        conversation_state: Uint8Array,
        microphone_mode?: number,
        volume_percentage?: number,
    },
    debug_info?: {
        aog_agent_to_assistant_json: string,
    },
}

export interface OpenUrlAction {
    url?: string,
    androidApp?: {
        packageName?: string,
        versions?: {
            minVersion?: number,
            maxVersion?: number,
        }[],
    },
    urlTypeHint?: number,
}

export interface Button {
    title?: string,
    openUrlAction?: OpenUrlAction,
}

export interface OrderState {
    state?: string,
    label?: string,
}

export interface Action {
    type?: number,
    button?: Button,
}

export interface Receipt {
    confirmedActionOrderId?: string,
    userVisibleOrderId?: string,
}

export interface Money {
    currencyCode?: string,
    units?: string,
    nanos?: number,
}

export interface Price {
    type?: number,
    amount?: Money,
}

export interface LineItemUpdate {
    orderState?: OrderState,
    price?: Price,
    reason?: string,
    extension?: {
        "@type": string,
        [key: string]: any,
    }
}

export interface UserNotification {
    title?: string,
    text?: string,
}

export interface RejectionInfo {
    type?: number,
    reason?: string,
}

export interface CancellationInfo {
    reason?: string,
}

export interface InTransitInfo {
    updatedTime?: string,
}

export interface FulfillmentInfo {
    deliveryTime?: string,
}

export interface ReturnInfo {
    reason?: string,
}

export interface SimpleResponse {
    textToSpeech?: string,
    ssml?: string,
    displayText?: string,
}

export interface Image {
    url?: string,
    accessibilityText?: string,
    height?: number,
    width?: number,
}

export interface BasicCard {
    title?: string,
    subtitle?: string,
    formattedText?: string,
    image?: Image,
    buttons?: Button[],
    imageDisplayOptions?: number,
}

export interface StructuredResponse {
    orderUpdate?: {
        googleOrderId?: string,
        actionOrderId?: string,
        orderState?: OrderState,
        orderManagementActions?: Action[],
        receipt?: Receipt,
        updateTime?: string,
        totalPrice?: Price,
        lineItemUpdates?: LineItemUpdate,
        userNotification?: UserNotification,
        infoExtension?: {
            "@type": string,
            [key: string]: any,
        },
        rejectionInfo?: RejectionInfo,
        cancellationInfo?: CancellationInfo,
        inTransitInfo?: InTransitInfo,
        fulfillmentInfo?: FulfillmentInfo,
        returnInfo?: ReturnInfo,
    },
}

export interface MediaObject {
    name?: string,
    description?: string,
    contentUrl?: string,
    largeImage?: Image,
    icon?: Image,
}

export interface MediaResponse {
    mediaType?: number,
    mediaObjects?: MediaObject[],
}

export interface CarouselBrowse {
    items?: Item[],
    imageDisplayOptions?: number,
}

export interface ColumnProperties {
    header?: string,
    horizontalAlignment?: number,
}

export interface Cell {
    text?: string,
}

export interface Row {
    cells?: Cell,
    dividerAfter?: boolean,
}

export interface TableCard {
    title?: string,
    subtitle?: string,
    image?: Image,
    columnProperties?: ColumnProperties[],
    rows?: Row[],
    buttons?: Button[],
}

export interface Item {
    simpleResponse?: SimpleResponse,
    basicCard?: BasicCard,
    structuredResponse?: StructuredResponse,
    mediaResponse?: MediaResponse,
    carouselBrowse?: CarouselBrowse,
    tableCard?: TableCard,
}

export interface Suggestion {
    title: string,
}

export interface LinkOutSuggestion {
    destinationName?: string,
    url?: string,
    openUrlAction?: OpenUrlAction,
}

export interface RichResponse {
    items: Item[],
    suggestions?: Suggestion[],
    linkOutSuggestion?: LinkOutSuggestion,
}

export interface ExpectedIntent {
    intent?: string,
    inputValueData?: {
        "@type": string,
        [name: string]: any,
    },
    parameterName?: string,
}
