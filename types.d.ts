declare class LCUConnector {
        constructor(path?: string);

        static getLCUPathFromProcess(): Promise<string | void>;

        static isValidLCUPath(dirPath: string): boolean;

        start(): void;

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
