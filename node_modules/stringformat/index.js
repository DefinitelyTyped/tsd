(function(g) {
	var FORMAT_RE = /({+)([^:{\|}]+)(\|([^:}]+))?(:(-?\d*)([ij]?))?(}+)/g,
		defined = function(x) { return typeof x !== 'undefined' },
		format = function() {
			var args = arguments,
				str = this

			return this.replace(FORMAT_RE, function() {
				var m = arguments,
					match = m[0],
					braces_in = m[1],
					id = m[2],
					// id not an int? named!
					named = (id % 1 !== 0),
					// if no property chain exist, get the name instead
					property_chain = m[4] || (named && id),
					padding = m[6],
					modifier = m[7],
					braces_out = m[8],
					property,
					obj = {},
					arg = named ? args[0] : args[id],
					res = []

				// escaped?
				if (braces_in.length > 1 && braces_out.length > 1)
					return match.slice(1, match.length - 1)

				// visit the properties
				property_chain = property_chain && property_chain.split('.') || []
				while (defined(property = property_chain.shift()) && defined(arg)) {
					// evaluate any intermediate function
					if (typeof arg === 'function') arg = arg.apply(obj, [])

					obj = arg
					arg = arg[property]
				}

				// Evaluate the leaf function
				if (typeof arg === 'function') arg = arg.apply(obj, [])

				// Integer modifier
				if ('i' === modifier) arg = Math.round(arg)

				// JSON modifier
				else if ('j' === modifier) arg = JSON.stringify(arg)

				// Nothing found :-(
				if (!defined(arg)) return match

				// Apply padding and return
				arg = String(arg)
				if (padding < 0) {
					res.push(arg)
					padding = 1 - padding
				}
				if (padding > arg.length) res.length = padding - arg.length
				if (!defined(res[0])) res[res.length] = arg
				return res.join(" ")
			})
		},
		main = function() {
			// Call as a method
			return format.apply(arguments[0], Array.prototype.slice.call(arguments, 1))
		}

	// Install as a method
	main.extendString = function(methodName) {
		String.prototype[methodName || 'format'] = format
	}

	// Export as window.stringformat (browser) or as a module (Node)
	g.top ? g.stringformat = main : module.exports = main
})(this)
