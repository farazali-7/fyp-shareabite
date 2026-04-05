import { io } from "socket.io-client";

const socket = io(process.env.EXPO_PUBLIC_API_URL, {
  transports: ["websocket"],
  autoConnect: false,  // connect only after token is available
});

export const initSocket = (token) => {
  if (socket.connected) return;
  socket.auth = { token };
  socket.connect();
};

export default socket;
