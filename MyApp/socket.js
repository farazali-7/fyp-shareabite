// socket.js
import { io } from "socket.io-client";

//  Replace with your backend local IP and port
const socket = io("http://10.138.152.131:3007", {
  transports: ["websocket"], // required for Expo
  jsonp: false,
   autoConnect: true
});



export default socket;
