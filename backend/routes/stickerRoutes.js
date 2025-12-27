import express from 'express';
import multer from 'multer';
import { saveStickerData, getStickerData, deleteStickerData, uploadStickerImage } from '../controllers/stickerController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Save sticker data
router.post('/save', saveStickerData);

// Get all sticker data
router.get('/', getStickerData);

// Delete sticker data
router.delete('/:id', deleteStickerData);

// Upload sticker image (PNG) and save metadata
router.post('/upload-image', upload.single('file'), uploadStickerImage);

export default router;
