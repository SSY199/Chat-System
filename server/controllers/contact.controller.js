import mongoose from "mongoose";
import User from "../models/auth.model.js";
import Message from "../models/contact.model.js";

export const searchContacts = async (req, res) => {
  try {
    const { searchTerm } = req.body;
    if (!searchTerm) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const sanitizedSearchTerm = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "\\$&");

    const regex = new RegExp(sanitizedSearchTerm, "i"); // Case-insensitive search
    const contacts = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
      ],
    });

    if (contacts.length === 0) {
      return res.status(404).json({ message: "No contacts found" });
    }

    return res.status(200).json({
      message: "Contacts fetched successfully",
      contacts,
    });
  } catch (error) {
    console.error("Error searching contacts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getContactsForDm = async (req, res) => {
  try {
    let { userId } = req;
    userId = new mongoose.Types.ObjectId(userId);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId },
          ],
        },
      },
      {
        $sort: {
          timestamp: -1,
        },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timestamp" }
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          color: "$contactInfo.color",
          image: "$contactInfo.image",
        },
      },
      {
        $sort: {
          lastMessageTime: -1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Contacts for DM fetched successfully",
      contacts,
    });
    
  } catch (error) {
    console.error("Error fetching contacts for DM:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const getAllContacts = async(req, res) => {
  try {

    const users = await User.find({
      _id: { $ne: req.userId}
    }, "firstName lastName _id email");

    const contacts = users.map(( user ) => ({
      label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
      value: user._id,
    }));

    return res.status(200).json({ contacts });
    
  } catch (error) {
    console.log({error});
    return res.status(500).send("Internal Server Error");
  }
}