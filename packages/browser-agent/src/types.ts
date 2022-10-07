export interface BrowserAgent{
    config: NrOptions;
    start: (options: NrOptions ) => Promise<boolean>;
    sharedAggregator: 
    // features
    // agentIdentifier
    // setErrorHandler
    // finished
    // addToTrace
    // inlineHit
    // addRelease
    // addPageAction
    // setCurrentRouteName
    // setPageViewName
    // setCustomAttribute
    // interaction
    // noticeError
}

export interface NrOptions {
    info: NrInfo,
    init: NrInit,
    loader_config: NrLoaderConfig,
    runtime: NrRuntime,
    exposed: boolean
}

interface NrShared {
    applicationID?: string;
    licenseKey?: string;
}

export interface NrRuntime {
    customTransaction?: any,
    disabled?: boolean,
    features?: {},
    maxBytes?: boolean,
    offset?: number,
    onerror?: () => any,
    origin?: string,
    ptid?: string,
    releaseIds?: {},
    sessionId?: string,
    xhrWrappable?: boolean,
    userAgent?: string
  }

export interface NrInfo extends NrShared {
    applicationID: string;
    licenseKey: string;
    beacon: string // sets beacon and errorBeacon
    errorBeacon?: string
    sa?: number
    queueTime?: number; 
    applicationTime?: number; 
    ttGuid?: string ; 
    user?: string; 
    account?: string; 
    product?: string; 
    extra?: string; 
    userAttributes?: string; 
    atts?: string; 
    transactionName?: string; 
    tNamePlain?: string; 
}

export interface NrInit {
    privacy?: { cookies_enabled?: boolean }, // *cli - per discussion, default should be boolean
    ajax?: { deny_list?: string, enabled?: boolean, auto?: boolean, harvestTimeSeconds?: number },
    distributed_tracing?: {
        enabled?: boolean
        exclude_newrelic_header?: boolean
        cors_use_newrelic_header?: boolean
        cors_use_tracecontext_headers?: boolean
        allowed_origins?: string[]
    }
    ssl?: boolean,
    obfuscate?: {regex?: string | RegExp, replacement?: string}[],
    jserrors?: {enabled?: boolean, auto?: boolean, harvestTimeSeconds?: number},
    metrics?: {enabled?: boolean, auto?: boolean},
    page_action?: {enabled?: boolean, auto?: false, harvestTimeSeconds?: number},
    page_view_event?: {enabled?: boolean, auto?: boolean},
    page_view_timing?: {enabled?: boolean, auto?: boolean, harvestTimeSeconds?: number},
    session_trace?: {enabled?: boolean, auto?: boolean, harvestTimeSeconds?: number},
    spa?: {enabled?: boolean, auto?: boolean, harvestTimeSeconds?: number}
}

export interface NrLoaderConfig extends NrShared {
    accountID?: string
    trustKey?: string
    agentID?: string
    xpid?: string
    licenseKey: string,
    applicationID: string,
}

export type NrNoticeError = (err: Error | String, customAttributes: Object) => void;
