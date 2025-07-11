// socket.js
import { io } from "socket.io-client";

//  Replace with your backend local IP and port
const socket = io("http://10.57.160.131:3004", {
  transports: ["websocket"], // required for Expo
  jsonp: false,
   autoConnect: true
});

export default socket;
