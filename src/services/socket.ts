import { io } from "socket.io-client";

const isBrowser = typeof window !== "undefined";

export const socket: any = isBrowser ? io(process.env.NEXT_PUBLIC_WEB_SOCKETS_API) : {};