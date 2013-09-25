///<reference path="tv4.d.ts" />

var str:string;
var bool:bool
var num:number;
var obj:any;

bool = tv4.validate(obj, obj);
num = tv4.validateResult(obj, obj).error.code;
num = tv4.validateMultiple(obj, obj).errors.length;

bool = tv4.addSchema(str, obj);
obj = tv4.getSchema(str);
obj = tv4.normSchema(str, str);
str = tv4.resolveUrl(str, str);

num = tv4.errorCodes['MY_NAME'];

num = tv4.missing.length;
num = tv4.error.code;