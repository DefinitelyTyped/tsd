/*
 UriTemplate Copyright (c) 2012-2013 Franz Antesberger. All Rights Reserved.
 Available via the MIT license.
*/

declare namespace uritemplate {

    interface UriTemplate {
        expand(data: {}): UriTemplate;
    }

    interface UriTemplateErrorOptions {
        expressionText: string
        message: string
        position: number                
    }

    interface UriTemplateError {
        new (options: UriTemplateErrorOptions)
    }

    interface UriTemplateStatic {
        new (templateText: string, expressions: Array<any>);
        parse(template: string): UriTemplate;
        UriTemplateError: UriTemplateError;
    }
}

// usage: import UriTemplate = require('uritemplate');
//        let template = UriTemplate.parse('http://localhost/query{?name,city}')
//        console.log(template.expand({name: 'Smith', city: 'Wodonga'}))

declare module 'uritemplate' {
    var UriTemplate: uritemplate.UriTemplateStatic;
    export = UriTemplate;    
}

