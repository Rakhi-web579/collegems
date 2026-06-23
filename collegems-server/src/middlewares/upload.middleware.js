import multer from "multer";
import path from "path";

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/assignments/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`); 
  },
});

// File Type Validation (The Filter)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf", // .pdf
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    // Reject the file
    cb(new Error("Invalid file type. Only PDF and Word documents are allowed."), false);
  }
};

// Export the configured middleware
export const uploadAssignment = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter,
});

// Resume Upload Middleware Configuration
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`); 
  },
});

const resumeFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF documents are allowed."), false);
  }
};

export const uploadResume = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: resumeFilter,
});
