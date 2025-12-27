import { supabase } from '../config/supabase.js';

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get product by barcode
export const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, barcode, category, stock } = req.body;

    if (!name || !barcode) {
      return res.status(400).json({ error: 'Name and barcode are required' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ name, description, price, barcode, category, stock }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, barcode, category, stock } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({ name, description, price, barcode, category, stock })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
