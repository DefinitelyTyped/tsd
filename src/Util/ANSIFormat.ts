module Util {

    // **********************************************************
    // Simple JavaScript Templating
    // John Resig - http://ejohn.org/ - MIT Licensed
    var tmpl: any;
    (function () {
        var cache = {};

        tmpl = function (str, data) {
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
            var fn = !/\W/.test(str) ?
              cache[str] = cache[str] ||
                tmpl(document.getElementById(str).innerHTML) :

              // Generate a reusable function that will serve as a template
              // generator (and which will be cached).
              new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +

                // Introduce the data as local variables using with(){}
                "with(obj){p.push('" +

                // Convert the template into pure JavaScript
                str
                  .replace(/[\r\t\n]/g, " ")
                  .split("{{").join("\t")
                  .replace(/((^|\}\})[^\t]*)'/g, "$1\r")
                  .replace(/\t=(.*?)\}\}/g, "',$1,'")
                  .split("\t").join("');")
                  .split("}}").join("p.push('")
                  .split("\r").join("\\'")
              + "');}return p.join('');");

            // Provide some basic currying to the user
            return data ? fn(data) : fn;
        };
    })();
    // **********************************************************

    class Colors {
        public static Black = 0;
        public static Red = 1;
        public static Green = 2;
        public static Yellow = 3;
        public static Blue = 4;
        public static Magenta = 5;
        public static Cyan = 6;
        public static White = 7;
        public static Default = 9;

        public static Bright = {
            On: 1,
            Off: 22
        }

        public static Bold = {
            On: 1,
            Off: 22
        }

        public static Italics = {
            On: 3,
            Off: 23
        }

        public static Underline = {
            On: 4,
            Off: 24
        }

        public static Inverse = {
            On: 7,
            Off: 27
        }

        public static Strikethrough = {
            On: 9,
            Off: 29
        }
    }

    export class Terminal {
        private static _reset: number = 0;

        private static _foreground(color: number): string {
            return "3" + color;
        }

        private static _background(color: number): string {
            return "4" + color;
        }

        private static _makeANSI(code: any): string {
            return '\033[' + code + 'm';
        }

        private static _environment = {
            'reset': Terminal._makeANSI(Terminal._reset),

            'bold': Terminal._makeANSI(Colors.Bold.On),
            'nobold': Terminal._makeANSI(Colors.Bold.Off),

            'bright': Terminal._makeANSI(Colors.Bright.On),
            'nobright': Terminal._makeANSI(Colors.Bright.Off),

            'italics': Terminal._makeANSI(Colors.Italics.On),
            'noitalics': Terminal._makeANSI(Colors.Italics.Off),

            'underline': Terminal._makeANSI(Colors.Underline.On),
            'nounderline': Terminal._makeANSI(Colors.Underline.Off),

            'inverse': Terminal._makeANSI(Colors.Inverse.On),
            'noinverse': Terminal._makeANSI(Colors.Inverse.Off),

            'strikethrough': Terminal._makeANSI(Colors.Strikethrough.On),
            'nostrikethrough': Terminal._makeANSI(Colors.Strikethrough.Off),

            'black': Terminal._makeANSI(Terminal._foreground(Colors.Black)),
            'red': Terminal._makeANSI(Terminal._foreground(Colors.Red)),
            'green': Terminal._makeANSI(Terminal._foreground(Colors.Green)),
            'yellow': Terminal._makeANSI(Terminal._foreground(Colors.Yellow)),
            'blue': Terminal._makeANSI(Terminal._foreground(Colors.Blue)),
            'magenta': Terminal._makeANSI(Terminal._foreground(Colors.Magenta)),
            'cyan': Terminal._makeANSI(Terminal._foreground(Colors.Cyan)),
            'white': Terminal._makeANSI(Terminal._foreground(Colors.White)),
            'default': Terminal._makeANSI(Terminal._foreground(Colors.Default)),

            'bgblack': Terminal._makeANSI(Terminal._background(Colors.Black)),
            'bgred': Terminal._makeANSI(Terminal._background(Colors.Red)),
            'bggreen': Terminal._makeANSI(Terminal._background(Colors.Green)),
            'bgyellow': Terminal._makeANSI(Terminal._background(Colors.Yellow)),
            'bgblue': Terminal._makeANSI(Terminal._background(Colors.Blue)),
            'bgmagenta': Terminal._makeANSI(Terminal._background(Colors.Magenta)),
            'bgcyan': Terminal._makeANSI(Terminal._background(Colors.Cyan)),
            'bgwhite': Terminal._makeANSI(Terminal._background(Colors.White)),
            'bgdefault': Terminal._makeANSI(Terminal._background(Colors.Default))
        }

        public static ANSIFormat(text: string) {
            return tmpl(text, Terminal._environment);
        }
    }
}