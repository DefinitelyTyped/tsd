declare module "csv-parse" {
    import stream = require('stream');

    interface columnsFunc {

    }

    interface CsvParseOptions extends stream.TransformOptions {
        delimiter?: string;
        rowDelimiter?: string;
        quote?: string;
        escape?:string;
        columns?:string[]|boolean|columnsFunc;
        comment?:string;
        objname?:string;
        relax?:boolean;
        skip_empty_lines?:boolean;
        trim?:boolean;
        ltrim?:boolean;
        rtrim?:boolean;
        auto_parse?:boolean;
    }

    function parse(opts?: CsvParseOptions) : stream.Transform;

    export = parse;
}
