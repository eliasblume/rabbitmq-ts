export enum ERpcQueues {
  multiply = "multiply-rpc",
  ping = "ping-rpc",
}

export interface IMultiplyProps {
  x: number;
  y: number;
}

export interface IMultiplyResponse {
  z: number;
}
