interface ShariffOptions {
    url?: Function | String;
    title?: Function | String;
    mailBody?: Function | String;
    mailSubject?: Function | String;
    mailUrl?: Function | String;
    lang?: String;
    services?: [any];
    orientation?: String;
    backendUrl?: any;
    langFallback?: String;
    theme?: String;
    mediaUrl?: String;
}

interface Shariff {
    defaults: any;
    element: JQuery;
    options: ShariffOptions;
    services: String[];
    _addButtonList(): void;
    _updateCounts(data: any): void;
    getShares(): void;
    getReferrerTrack(): void;
    getTitle(): void;
    getOption(name: String): void;
    getURL(): void;
    getInforUrl(): void;
    getMeta(name: String): void;
    getLocalized(data: any, key: any): any;
    $socialshareElement(): JQuery;
}

interface ShariffFactory {
    new(container: JQuery, options: ShariffOptions): Shariff;
}

declare module "shariff" {
    export = shariff;
}

declare var shariff: ShariffFactory;
