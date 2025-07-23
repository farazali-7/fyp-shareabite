// socket.js
import { io } from "socket.io-client";

//  Replace with your backend local IP and port
const socket = io("http://10.122.209.131:3008", {
  transports: ["websocket"], // required for Expo
  jsonp: false,
   autoConnect: true
});



export default socket;
