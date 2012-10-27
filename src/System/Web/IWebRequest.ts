module System.Web {
    export interface IWebRequest { 
        getUrl(url: string, callback: (data: string) => void ): void;
    }
}