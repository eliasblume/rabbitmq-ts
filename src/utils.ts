import {ConsumeMessage} from "amqplib";

export function objToBuffer(obj: object): Buffer {
    return Buffer.from(JSON.stringify(obj));
}

export function msgToObj(msg: ConsumeMessage): object {
    return JSON.parse(msg.content.toString());
}


