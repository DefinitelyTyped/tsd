declare module 'postal' {

	export var configuration: Configuration;

	export function channel(topic?: string): ChannelDefinition;

	export function publish(topic: string, data: PublishEnvelope): void;

	export function subscribe(args: SubscribeOpts): SubscriptionDefinition;

	export function addWireTap(callback: Callback): void;

	export function linkChannels( source:ChannelIdent , destination:ChannelIdent): void;
	export function linkChannels( source:ChannelIdent , destination:ChannelIdent[]): void;
	export function linkChannels( source:ChannelIdent[] , destination:ChannelIdent): void;
	export function linkChannels( source:ChannelIdent[] , destination:ChannelIdent[]): void;

	export var utils: Utils;

	export interface ChannelDefinition {
		channel: string;
		subscribe(topic: string, callback: Callback ): SubscriptionDefinition;
		publish(topic: string, data: any): void;
		publish(data: PublishEnvelope): void;
	}

	export interface SubscriptionDefinition {
		channel: string;
		topic: string;
		callback: Callback;
		constraints: any[];
		context: any;

		subscribe( callbacl: Callback): void;
		unsubscribe(): void;

		defer(): void;
		disposeAfter (num: number): void;

		distinct(): number;
		distinctUntilChanged(): void;

		withConstraint(predicate: Predicate): void;
		withConstraints(predicate: Predicate[]): void;
		withContext( context: any): void;
		withDebounce( interval: number ): void;
		withDelay( waitTime: number ): void;
		withThrottle( interval: number ):void;
	}

	export interface ChannelIdent {
		channel?: string;
		topic?: string;
	}

	export interface PublishEnvelope {
		channel?: string;
		topic?: string;
		data?: any;
	}

	export interface ReceiveEnvelope {
		channel: string;
		topic: string;
		data: any;
		timeStamp: Date;
	}

	export interface SubscribeOpts {
		channel: string;
		topic: string;
		callback: Callback;
	}

	export interface Configuration {
		bus: any;
		resolver: any;
		DEFAULT_CHANNEL: string;
		SYSTEM_CHANNEL: string;
	}

	export interface Callback {
		(data: any, envelope: ReceiveEnvelope): void;
	}

	export interface Predicate {
		(data: any, envelope: ReceiveEnvelope): boolean;
	}

	export interface Utils {
		getSubscribersFor(topic: string): SubscriptionDefinition[];
		getSubscribersFor(channel: string, topic: string): SubscriptionDefinition[];
		getSubscribersFor(options : SubscriptionDefinition): SubscriptionDefinition[];
		getSubscribersFor(options : ChannelIdent): SubscriptionDefinition[];

		reset(): void;
	}
}
