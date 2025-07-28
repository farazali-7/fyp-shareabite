import { io } from "socket.io-client";

//  Replace with your backend local IP and port
const socket = io("http://172.26.198.131:3005", {
  transports: ["websocket"],
  jsonp: false,
   autoConnect: true
});



export default socket;
