import { Mqlib } from "../src";
import { ERpcQueues, IMultiplyProps, IMultiplyResponse } from "./rpc_types";

const url = "amqp://127.0.0.1:5672";

// a very simple helper class
// would work without it but this better shows how it is intended to be used
class MultiplyClient {
    private mqlib: Mqlib;

    private constructor(mqlib: Mqlib) {
        this.mqlib = mqlib;
    }

    public static async init() {
        return new MultiplyClient(await Mqlib.init(url));
    }

    // by defining interfaces that are shared between client and server you have the
    // feeling of typed responses
    public async multiply(props: IMultiplyProps): Promise<IMultiplyResponse> {
        return (await this.mqlib.rpcClient(ERpcQueues.multiply, props)) as IMultiplyResponse;
    }

    public async close() {
        await this.mqlib.close();
    }
}

(async () => {
    const multiplyClient = await MultiplyClient.init();
    console.log(await multiplyClient.multiply({ x: 100, y: 200 }));

    await multiplyClient.close();
})();
