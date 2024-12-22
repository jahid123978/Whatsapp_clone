import e from "express";
import getPrismaInstance from "../utils/PrismaClient.js"
import {renameSync} from "fs"
export const addMessage = async(req, res, next)=>{
    try{
   const prisma = getPrismaInstance();
   const {message, from, to} = req.body;
//    console.log("req: ", req.body);
   const getUser = onlineUsers.get(to);
   if(message && from && to){
    const newMessage = await prisma.messages.create({
        data:{
            message,
            sender:{connect:{id: parseInt(from)}},
            reciever:{connect:{id: parseInt(to)}},
            messageStatus: getUser === undefined?"sent": "delivered",
        },
        include:{sender: true, reciever: true},
    })
    return res.status(200).send({message: newMessage})
   }
   return res.status(400).send("From, to and Message is required")
    }catch(error){
        next(error)
    }
}

export const getMessages = async(req, res, next)=>{
    try{
        const prisma = getPrismaInstance();
        const {from, to} = req.params;
       
        const messages = await prisma.messages.findMany({
        where:{
            OR: [
                {
                    senderId: parseInt(from),
                    recieverId: parseInt(to),
                },
                {
                    senderId: parseInt(to),
                    recieverId: parseInt(from),
                },
                
            ]
        },
        orderBy:{
            id: "asc",
        }
        });
     const unreadMessages = [];
     messages.forEach((message, index)=>{
        if(message?.messageStatus !== "read" && message?.senderId === parseInt(to)){
            messages[index].messageStatus = "read";
            unreadMessages.push(message.id);
        }
     });
   
     await prisma.messages.updateMany({
        where:{
            id: {in: unreadMessages},
        },
        data:{
            messageStatus: "read"
        }
     })
     res.status(200).json({messages})
    }catch(error){
        next(error)
    }
}
 export const addImageMessage = async(req, res, next)=>{
    try{
        if(req.file){
            const date = Date.now();
            let fileName = "uploads/images/"+ date + req.file.originalname;
            renameSync(req.file.path, fileName);
            const prisma = getPrismaInstance();
            const {from, to} = req.query;
            if(from && to){
                const message = await prisma.messages.create({
                 data:{
                    message:fileName,
                    sender:{connect:{id: parseInt(from)}},
                    reciever:{connect:{id: parseInt(to)}},
                    type: "image"
                 }   
                }) 
                return res.status(201).json({message});
            }
            return res.status(400).send("From, to is required");

        }
        return res.status(400).send("Image is requred");


    }
    catch(error){
        console.log(error)
    }
}
 export const addAudioMessage = async(req, res, next)=>{
    try{
        if(req.file){
            const date = Date.now();
            let fileName = "uploads/recordings/"+ date + req.file.originalname;
            renameSync(req.file.path, fileName);
            const prisma = getPrismaInstance();
            const {from, to} = req.query;
            if(from && to){
                const message = await prisma.messages.create({
                 data:{
                    message:fileName,
                    sender:{connect:{id: parseInt(from)}},
                    reciever:{connect:{id: parseInt(to)}},
                    type: "audio"
                 }   
                }) 
                return res.status(201).json({message});
            }
            return res.status(400).send("From, to is required");

        }
        return res.status(400).send("Audio is requred");


    }
    catch(error){
        console.log(error)
    }
}

export const getInitialContactswithMessages = async(req, res, next)=>{
    try{
     const userId = parseInt(req.params.from);
     const prisma = getPrismaInstance();
     const user = await prisma.user.findUnique({
        where: {id: userId},
        include: {
            sentMessages:{
                include: {
                    reciever: true,
                    sender: true,
                },
                orderBy:{
                    createdAt: 'desc',
                },
            },
            recievedMessages:{
                include:{
                    reciever: true,
                    sender: true
                },
                orderBy:{
                    createdAt: 'desc',
                },
            }
        }
     });
     const messages = [...user.sentMessages, ...user.recievedMessages];
     messages.sort((a, b)=>b.createdAt.getTime()-a.createdAt.getTime());
     const users = new Map();
     const messageStatusChanges = [];
     messages.forEach((msg)=>{
        const isSender = msg?.senderId === userId;
        const calculatedId = isSender? msg.recieverId : msg.senderId;
        if(msg.messageStatus === "sent"){
            messageStatusChanges.push(msg.id)
        }
        const {id, type, message, messageStatus, createdAt, senderId, recieverId} = msg;
        if(!users.get(calculatedId)){
            let user = {
                messageId: id,
                type,
                message,
                messageStatus,
                createdAt,
                senderId,
                recieverId
            }
            if(isSender){
                 user = {
                    ...user,
                    ...msg.reciever,
                    totalUnreadMessages: 0,
                 }
            }
            else{
                user = {
                    ...user,
                    ...msg.sender,
                    totalUnreadMessages: messageStatus !== "read"?1:0,
                }
            }
            users.set(calculatedId, {...user});
        } else if(messageStatus !== "read" && !isSender){
            const user = users.get(calculatedId);
            users.set(calculatedId, {
              ...user,
              totalUnreadMessages: user.totalUnreadMessages + 1,
            })
        }
     });
     if(messageStatusChanges.length){
        await prisma.messages.updateMany({
            where:{
                id: {in: messageStatusChanges},
            },
            data:{
                messageStatus: "delivered"
            },
        })
     }

     return res.status(200).json({
        users:Array.from(users.values()),
        onlineUsers: Array.from(onlineUsers.keys()),
     })
    }
    catch(error){
        next(error)
    }
}