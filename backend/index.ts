import { Server } from "socket.io";

function main() {
  const io = new Server({
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("New connection :", socket.id);

    socket.on("message", (message) => {
      console.log("Received message :", message);

      io.send(message);
    });
  });

  io.listen(3000);
  console.log("Server started on port 3000");
}

main();