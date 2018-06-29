/** Specifies the relation between upstream messages and emitted items. */
export const enum Kind {

	/** No guarantees. */
	Unknown = 0,

	/**
	 * The source only emits items upon messages (pulls) from the sink.
	 * @see https://github.com/mperktold/callbag-pullable
	 */
	Pull = 1,

	/** The source emits items to the sink without waiting for messages from the sink. */
	Push = 2
}

/** Specifies the operating mode, i.e. timing constraints of emitted items. */
export const enum Mode {

	/** No guarantees. */
	Unknown = 0,

	/** Items are emitted immediately. */
	Sync = 1,

	/** Items are emitted asynchronously. */
	Async = 2
}

/**
 * A source of items.
 * It can be consumed by connecting a {@link Sink} and opening the resulting connection.
 *
 * @param <T> The type of items emitted by this source.
 * @param <K> The statically known kind of this source.
 * @param <M> The statically known mode of this source.
 */
export interface Source<
	T,
	K extends Kind = Kind,
	M extends Mode = Mode>
{
	/** The kind this source. */
	kind: K;

	/** The mode of this source. */
	mode: M;

	/**
	 * Connects a sink to this source. When the connection is established, the source
	 * must pass it to the `onConnect` method of the connected sink. Only when the
	 * `onConnect` call returns, the source is allowed to push items to the sink or
	 * terminate the sink.
	 */
	connect(sink: Sink<T>): void;
}

/**
 * A sink for items consumed from a {@link Source}.
 *
 * @param <T> The type of items emitted by this source.
 */
export interface Sink<T> {

	/**
	 * Notifies this sink of a `Connection` established with a source.
	 * If this sink is an intermediate one, i.e. the inner sink of an operator,
	 * it must invoke the `onConnect` method of its outer sink.
	 */
	onConnect(connection: Connection): void;

	/** Pushes an item to this sink. */
	onNext(item: T): void;

	/**
	 * The connection to the source was closed.
	 * The reason for this can be an explicit close of the connection through its
	 * close method, or because there where no more items, or because of an error.
	 */
	onDisconnect(error?: any): void;
}

/**
 * A connection from a {@link Sink} to its {@link Source}.
 * It provides
 */
export interface Connection {

	/**
	 * Passes a message up to the source. A message without a payload is
	 * interpreted as pull, i.e. as a request to push the next item.
	 * A push-based source must ignore a pull.
	 * A pull-based source must follow a pull with exactly one push, or with a
	 * close notification if there are no more items to be pulled.
	 */
	message(payload?: any): void;

	/**
	 * Closes this connection.
	 * Tells this stage to stop, either because an error occurred or because no further items are needed.
	 */
	disconnect(): void;
}

/**
 * An object that is both a sink and a source.
 * It can be used as an event listening facility, where events are published through `onNext` of its
 * sink interface to reach all sinks connected to it.
 */
export type Subject<T, M extends Mode = Mode> = Sink<T> & Source<T, Kind.Push, M>;

/** An operator that transforms a source into another source, but preserves kind and mode of the original source. */
export type PreservingOp<T, R> = <K extends Kind, M extends Mode>(arg: Source<T, K, M>) => Source<R, K, M>;
