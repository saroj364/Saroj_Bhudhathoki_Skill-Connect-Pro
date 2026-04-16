const mongoose = require("mongoose");
const Notification = require("../models/notificationModel");
const Message = require("../models/message");
const Chat = require("../models/Chat");
const { generateEsewaPayload } = require("../controllers/paymentController");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register-user", (userId) => {
      socket.join(userId); 
      console.log("User registered:", userId);
    });

    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
      console.log("Joined chat:", chatId);
    });

    socket.on("send-message", async (data) => {
      try {
        const { chatId, senderId, text, type, payload, tempId } = data;

        const messageData = {
          chat: chatId,
          sender: senderId,
          message: text || "",
          type: type || "text",
          payload: payload || null,
        };

        if (type === "hire-request") {
          messageData.status = "pending";
        }

        const newMessage = await Message.create(messageData);

        const populatedMsg = await newMessage.populate("sender", "_id username");

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: {
            message: type === "hire-request" ? "Hire Request" : text,
            sender: senderId,
            createdAt: new Date(),
          },
          updatedAt: new Date(),
        });

         const msgObj = newMessage.toObject();

        msgObj.tempId = tempId;
        io.to(chatId).emit("receive-message", populatedMsg);

      } catch (err) {
        console.error("Send message error:", err);
      }
    });

    socket.on("typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("typing", userId.toString());
    });

    socket.on("stop-typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("stop-typing", userId.toString());
    });

    socket.on("hire-response", async ({ hireId, accepted }) => {
      try {
        const message = await Message.findById(hireId).populate("chat");

        if (!message) return;

        message.status = "responded";
        message.accepted = accepted;
        await message.save();

        io.to(message.chat._id.toString()).emit("hire-updated", {
          hireId,
          accepted,
        });

        if (accepted) {
          const payload = await generateEsewaPayload(message);

          const clientId = message.sender.toString(); // sender is the client
          io.to(clientId).emit("payment-ready", payload);
        }
      } catch (err) {
        console.error("Hire response error:", err);
      }
    });

    socket.on("send-notification", async (data) => {
      try {
        const notification = new Notification({
          user: new mongoose.Types.ObjectId(data.userId),
          type: data.type,
          title: data.title,
          message: data.message,
          relatedUserId: data.relatedUserId
            ? new mongoose.Types.ObjectId(data.relatedUserId)
            : null,
        });

        await notification.save();
        io.to(data.userId).emit("receive-notification", notification);
      } catch (err) {
        console.error("Notification error:", err);
      }
    });

    socket.on("join-room", (roomId) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room && room.size >= 2) {
        socket.emit("room-full");
        return;
      }
      socket.join(roomId);
      const users = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      if (users.length === 2) {
        io.to(users[0]).emit("create-offer");
        io.to(users[1]).emit("wait-offer");
      }
    });

    socket.on("offer", ({ roomId, offer }) => socket.to(roomId).emit("offer", { offer }));
    socket.on("answer", ({ roomId, answer }) => socket.to(roomId).emit("answer", { answer }));
    socket.on("ice-candidate", ({ roomId, candidate }) => socket.to(roomId).emit("ice-candidate", { candidate }));
    socket.on("end-call", (roomId) => socket.to(roomId).emit("call-ended"));

        // join class room
    socket.on("join-class", ({ classId, user }) => {
      socket.join(classId);

      socket.to(classId).emit("system-message", {
        type: "system",
        message: `${user.username} joined the class`,
      });
    });
    socket.on("send-message-class", (msg) => {
      socket.to(msg.classId).emit("receive-message-class", msg);
    });


    // leave class
    socket.on("leave-class", ({ classId, user }) => {
      socket.leave(classId);

      socket.to(classId).emit("system-message", {
        type: "system",
        message: `${user.username} left the class`,
      });
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          socket.to(roomId).emit("peer-left");
        }
      });
      console.log("User disconnected:", socket.id);
    });
  });
};