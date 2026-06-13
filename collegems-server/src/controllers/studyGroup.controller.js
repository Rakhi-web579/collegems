import StudyGroup from "../models/StudyGroup.model.js";
import ChatMessage from "../models/ChatMessage.model.js";

export const createStudyGroup = async (req, res) => {
  try {
    const { name, description, course } = req.body;
    const studyGroup = new StudyGroup({
      name,
      description,
      course,
      createdBy: req.user.userId,
      members: [req.user.userId], // Creator is automatically a member
    });
    await studyGroup.save();
    res.status(201).json(studyGroup);
  } catch (error) {
    res.status(500).json({ message: "Error creating study group", error: error.message });
  }
};

export const getStudyGroups = async (req, res) => {
  try {
    // Only fetch active study groups
    const studyGroups = await StudyGroup.find({ isActive: true })
      .populate("createdBy", "name email")
      .populate("course", "name")
      .sort("-createdAt");
    res.status(200).json(studyGroups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching study groups", error: error.message });
  }
};

export const joinStudyGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const studyGroup = await StudyGroup.findById(id);
    if (!studyGroup) {
      return res.status(404).json({ message: "Study group not found" });
    }
    
    if (!studyGroup.members.includes(req.user.userId)) {
      studyGroup.members.push(req.user.userId);
      await studyGroup.save();
    }
    
    res.status(200).json(studyGroup);
  } catch (error) {
    res.status(500).json({ message: "Error joining study group", error: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await ChatMessage.find({ groupId: id })
      .populate("senderId", "name email")
      .sort("createdAt");
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat history", error: error.message });
  }
};
