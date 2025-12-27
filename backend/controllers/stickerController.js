import { supabase } from '../config/supabase.js';

const toNumberOrNull = (val) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (s === '') return null;
  // Strip currency and non-numeric except dot and minus
  const cleaned = s.replace(/[^0-9.\-]/g, '');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

export const saveStickerData = async (req, res) => {
  try {
    const { title, sku, price, barcode, format, source, quantity, image_url } = req.body;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    const { data, error } = await supabase
      .from('barcode_stickers')
      .upsert([
        {
          title,
          sku,
          price: toNumberOrNull(price),
          barcode,
          format,
          source, // 'manual' or 'excel'
          quantity: toNumberOrNull(quantity) || 1,
          image_url: image_url || null,
          created_at: new Date(),
        },
      ], { onConflict: 'barcode' })
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save sticker data' });
  }
};

export const getStickerData = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('barcode_stickers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sticker data' });
  }
};

export const deleteStickerData = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('barcode_stickers')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, message: 'Sticker deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete sticker data' });
  }
};

export const uploadStickerImage = async (req, res) => {
  try {
    const file = req.file;
    const { title = '', sku = '', price = '', barcode = '', format = 'CODE128', source = 'manual', quantity = 1 } = req.body || {};

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    const safeBarcode = String(barcode).replace(/[^a-zA-Z0-9-_]/g, '_');
    const path = `barcodes/${safeBarcode}.png`;

    const { error: uploadError } = await supabase
      .storage
      .from('stickers')
      .upload(path, file.buffer, { contentType: file.mimetype || 'image/png', upsert: true });

    if (uploadError) {
      return res.status(400).json({ error: uploadError.message });
    }

    const { data: publicData } = supabase.storage.from('stickers').getPublicUrl(path);
    const imageUrl = publicData?.publicUrl || null;

    const { data, error } = await supabase
      .from('barcode_stickers')
      .upsert([
        {
          title,
          sku,
          price: toNumberOrNull(price),
          barcode,
          format,
          source,
          quantity: toNumberOrNull(quantity) || 1,
          image_url: imageUrl,
          created_at: new Date(),
        },
      ], { onConflict: 'barcode' })
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, image_url: imageUrl, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload sticker image' });
  }
};
