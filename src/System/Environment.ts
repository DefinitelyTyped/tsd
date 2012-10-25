module System { 
    export class Environment { 
        public static isNode() { 
            return !(typeof ActiveXObject === "function");
        }

        public static isWsh() { 
            return !Environment.isNode();
        }
    }
}