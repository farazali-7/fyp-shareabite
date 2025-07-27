// socket.js
import { io } from "socket.io-client";

//  Replace with your backend local IP and port
const socket = io("http://10.207.159.131:3005", {
  transports: ["websocket"], // required for Expo
  jsonp: false,
   autoConnect: true
});



export default socket;
