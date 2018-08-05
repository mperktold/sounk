/** Identifies a protocol of how source and sink interact with each other. */
export interface Protocol {

    /** The name of the protocol. */
    name: string;

    /**
     * Indicates whether items are emitted asynchronously.
     * `true` if all items are emitted asnynchronously, `false`
     * if all items are emitted synchronously, `undefined` if
     * synchronizity may vary among items.
     */
    async?: boolean;
}

/** A synchronous protocol. */
export interface SyncProtocol extends Protocol {
    async: false;
}

/** An asynchronous protocol. */
export interface AsyncProtocol extends Protocol {
    async: true;
}

/**
 * A source of items.
 * It can be consumed by connecting a {@link Sink} to it.
 *
 * @param <T> The type of items emitted by this source.
 * @param <P> The type of the protocol of this source.
 */
export interface Source<T, P extends Protocol = Protocol> {

    /** The protocol of this source. */
    protocol: P;

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

    /** Passes a message up to the source. */
    message(payload?: any): void;

    /** Disconnects this connection, effectively telling the source to stop emitting items to the sink. */
    disconnect(): void;
}

/** An operator that transforms a source into another source of the same protocol. */
export type ProtocolPreservingOp<T, R> = <P extends Protocol>(arg: Source<T, P>) => Source<R, P>;
