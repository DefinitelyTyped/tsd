declare module 'chai-as-promised' {
  function chaiAsPromised(chai: any, utils: any): void;
  export = chaiAsPromised;
}

declare module chai {
  interface Expect {
    become(expected: any): Expect;
    fulfilled: Expect;
    rejected: Expect;
    rejectedWith(expected: any): Expect;
    notify(fn: Function): Expect;
  }

  interface LanguageChains {
    eventually: Expect;
  }

  interface Assert {
    eventually: Assert;
    isFulfilled(promise: any, message?: string): void;
    becomes(promise: any, expected: any, message?: string): void;
    doesNotBecome(promise: any, expected: any, message?: string): void;
    isRejected(promise: any, message?: string): void;
    isRejected(promise: any, expected: any, message?: string): void;
    isRejected(promise: any, match: RegExp, message?: string): void;
  }
}
