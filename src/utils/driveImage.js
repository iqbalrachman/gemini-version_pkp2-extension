import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// ID File Google Drive Default kalau ada foto yang gagal di-download (Jangan diubah)
const PLACEHOLDER_ID = '1lT_Vv4lv2LA085PKwKynV6ASIC_rTIoL'; 

export async function processDriveImage(driveId, category = 'unit', index = 0) {
  if (!driveId) return '/images/placeholder.webp';

  const outputDir = path.join(process.cwd(), 'public', 'images', category);
  const fileName = `${driveId}-${index}.webp`;
  const outputPath = path.join(outputDir, fileName);
  const publicUrl = `/images/${category}/${fileName}`;

  // Kalau fotonya udah pernah didownload sebelumnya, jangan download lagi biar proses build cepat
  if (fs.existsSync(outputPath)) {
    return publicUrl;
  }

  // Bikin foldernya kalau belum ada
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // API Public Google Drive untuk mendownload file (Ini rahasianya!)
    const downloadUrl = `https://drive.google.com/uc?id=${driveId}&export=download`;
    
    console.log(`Mendownload foto ${category} dari Drive... (${driveId})`);
    
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error('Gagal akses Google Drive. Pastikan file di-set Anyone with the link.');
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Proses Kompresi ke WebP pakai Sharp
    console.log(`Mengompresi foto ${category}...`);
    
    let sharpInstance = sharp(buffer).webp({ quality: 75 }); // Kualitas 75% udah sangat bagus dan sizenya kecil
    
    // Resize berdasarkan kategori biar ukuran file makin kecil
    if (category === 'hero') {
        sharpInstance = sharpInstance.resize(1920, 1080, { fit: 'cover' }); // Full HD buat Hero
    } else if (category === 'unit') {
        sharpInstance = sharpInstance.resize(800, 600, { fit: 'cover' }); // Resolusi standar buat gallery
    }

    await sharpInstance.toFile(outputPath);
    console.log(`✅ Sukses menyimpan: ${fileName}`);

    return publicUrl;
  } catch (error) {
    console.error(`❌ Error processDriveImage (${driveId}):`, error.message);
    // Kalau error, kembalikan gambar placeholder kosong (Biar web nggak nge-blank)
    return '/images/placeholder.webp'; 
  }
}
