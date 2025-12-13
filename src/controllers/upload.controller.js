import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        // Create dir if not exists
        if (!fs.existsSync(uploadDir)) {
            console.log("Creating upload dir:", uploadDir);
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|mp4|mov/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File upload only supports images and videos!'));
    }
});

/**
 * POST /api/upload
 */
export const uploadFile = (req, res) => {
    console.log("Upload request received. File:", req.file ? req.file.filename : 'None');
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        // Return public URL (assuming server serves 'public' folder via static middleware)
        // If served at root static:
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            fileUrl: fileUrl,
            fileName: req.file.filename
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "File upload failed" });
    }
};
