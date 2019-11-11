declare class LCUConnector {

    /**
     * @param {string} [path]
     */
    constructor(path?: string);

    /**
     * Get path from running instance of the lcu
     */
    static getLCUPathFromProcess(): Promise<string | void>;

    /**
     * Checks if the path given is a valid lcu path.
     *
     * @param dirPath
     * @returns {boolean}
     */
    static isValidLCUPath(dirPath: string): boolean;

    /**
     * Starts the lcu-connector
     */
    start(): void;

    /**
     * Stops the lcu-connector
     */
    stop(): void;

    on(event: 'connect', listener: (data: {
        address: string,
        port: number,
        username: string,
        password: string,
        protocol: string
    }) => void): this;

    on(event: 'disconnect', listener: () => void): this;
}

export = LCUConnector;
