import { Channel, Connection } from "amqplib";
import amqp from "amqplib";
import uuid from "node-uuid";

import { msgToObj, objToBuffer } from "./utils";
import { Options } from "amqplib/properties";

export class Mqlib {
    public ch: Channel;
    public conn: Connection;

    private constructor(ch: Channel, conn: Connection) {
        this.ch = ch;
        this.conn = conn;
    }

    public static async init(url: string | Options.Connect, socketOptions?: any) {
        const conn = await amqp.connect(url, socketOptions);
        return new Mqlib(await conn.createChannel(), conn);
    }

    public async rpcServer(queue: string, fn: (obj: any) => any) {
        await this.ch.assertQueue(queue, { durable: false });
        await this.ch.prefetch(1);
        await this.ch.consume(queue, async msg => {
            if (msg) {
                const response = objToBuffer(await fn(msgToObj(msg)));
                this.ch.sendToQueue(msg.properties.replyTo, response, {
                    correlationId: msg.properties.correlationId,
                });
                this.ch.ack(msg);
            }
        });
    }

    public async rpcClient(queueName: string, obj: object): Promise<object> {
        return await new Promise(async resolve => {
            const corrId = uuid.v4();
            const { queue } = await this.ch.assertQueue("", { exclusive: true, durable: true });
            await this.ch.consume(
                queue,
                msg => {
                    if (msg && msg.properties.correlationId === corrId) {
                        resolve(msgToObj(msg));
                    }
                },
                { noAck: true }
            );
            this.ch.sendToQueue(queueName, objToBuffer(obj), {
                correlationId: corrId,
                replyTo: queue,
            });
        });
    }

    public async assertQueue(queueName: string, queueOptions?: Options.AssertQueue) {
        await this.ch.assertQueue(queueName, queueOptions || {});
    }

    public async producerQueue(queueName: string, obj: object) {
        this.ch.sendToQueue(queueName, objToBuffer(obj));
    }

    public async consumerQueue(queueName: string, fn: (obj: object) => void) {
        await this.ch.consume(queueName, async msg => {
            if (msg) await fn(msgToObj(msg));
        });
    }

    public async close() {
        await this.conn.close();
    }
}
