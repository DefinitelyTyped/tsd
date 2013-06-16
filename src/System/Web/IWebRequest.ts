module System.Web {
    export interface IWebRequest { 
        getUrl(url: string, callback: (err: any, data: string) => void ): void;
    }
}