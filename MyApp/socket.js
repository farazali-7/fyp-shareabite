import { io } from "socket.io-client";

//  Replace with your backend local IP and port
const socket = io("http://10.90.162.131:3007", {
  transports: ["websocket"],
  jsonp: false,
   autoConnect: true
});



export default socket;
