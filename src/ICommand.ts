interface ICommand {
	shortcut: string;
	usage: string;
	accept: (args: Array) => bool;
	exec: (args: Array) => void;
	toString: () => string;
}