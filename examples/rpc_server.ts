import { Mqlib } from "../src";
import { ERpcQueues, IMultiplyProps, IMultiplyResponse } from "./rpc_types";

const url = "amqp://127.0.0.1:5672";

(async () => {
    const mqlib = await Mqlib.init(url);
    await mqlib.rpcServer(ERpcQueues.multiply, (props: IMultiplyProps): IMultiplyResponse => {
        return { z: props.x * props.y };
    });
})();
