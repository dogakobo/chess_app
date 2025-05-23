import { io } from "socket.io-client";

const isBrowser = typeof window !== "undefined";

export const socket: any = isBrowser ? io('http://localhost:3001') : {};