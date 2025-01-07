import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId, io } from "../lib/socket.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"


export const getUserForSideBar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id
        const filteredUsers = await User.find({_id: {$ne:loggedInUserId}}).select("-password")

        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log("Lỗi getUserForSideBar trong server: ", error.message)
        res.status(500).json({message: "Lỗi server"})
    }
}

export const getMessages = async (req, res) => {
    try {
        const {id: userToChatId } = req.params
        const senderId = req.user._id

        const message = await Message.find({
            $or: [
                {senderId: senderId, recieverId: userToChatId},
                {senderId: userToChatId, recieverId: senderId}
            ]
        })

        res.status(200).json(message)
    } catch (error) {
        console.log("Lỗi getMessage: ", error.message)
        res.status(500).json({error: "Lỗi server"})
    }
}

export const sendMessages = async (req, res) => {
    try {
        const { text, image } = req.body
        const {id: recieverId} = req.params
        const senderId = req.user._id

        let imageUrl
        if (image) {
            //Lưu ảnh vào cloudinary dưới dạng base64
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = new Message ({
            senderId,
            recieverId,
            text,
            image: imageUrl
        })
        
        await newMessage.save()

        const recieverSocketId = getReceiverSocketId(recieverId)
        if(recieverId) {
            io.to(recieverSocketId).emit("newMessage", newMessage)
        }

        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Lỗi sendMessage: ", error.message)
        res.status(500).json({error: "Lỗi server"})
    }
}