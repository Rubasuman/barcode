import express from 'express';
import {
  getAllProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/barcode/:barcode', getProductByBarcode);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
