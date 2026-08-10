const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;

// Load env
dotenv.config({ path: path.join(process.cwd(), '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const seedFilePath = path.join(process.cwd(), 'prisma/seed.ts');

async function migrate() {
  console.log('🚀 Starting Cloudinary Migration Script...');
  
  let seedContent = fs.readFileSync(seedFilePath, 'utf-8');
  
  // 1. Extract Unsplash URLs
  const unsplashRegex = /https:\/\/images\.unsplash\.com\/[^\s"',]+(?:'|")/g;
  const matches = seedContent.match(unsplashRegex);
  
  if (!matches) {
    console.log('No Unsplash images found in seed.ts. Maybe already migrated?');
    return;
  }
  
  // Clean up quotes from matches and deduplicate
  const uniqueUrls = [...new Set(matches.map(m => m.slice(0, -1)))];
  console.log(`Found ${uniqueUrls.length} unique Unsplash images to migrate.`);
  
  const urlMap = {};
  
  // 2. Upload images to Cloudinary
  for (const url of uniqueUrls) {
    console.log(`Uploading: ${url.substring(0, 50)}...`);
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: 'kissan_mithar_seed_data'
      });
      urlMap[url] = result.secure_url;
      console.log(`✅ Uploaded to: ${result.secure_url}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${url}:`, error);
    }
  }
  
  // 3. Upload a dummy PDF
  console.log('Uploading generic Orchard Report PDF...');
  // A tiny valid base64 PDF
  const dummyPdfBase64 = 'data:application/pdf;base64,JVBERi0xLjEKJcKlwrHDqwoKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCgoyIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2VzCiAgICAgL0tpZHMgWzMgMCBSXQogICAgIC9Db3VudCAxCiAgICAgL01lZGlhQm94IFswIDAgMzAwIDE0NF0KICA+PgplbmRvYmoKCjMgMCBvYmoKICA8PCAgL1R5cGUgL1BhZ2UKICAgICAgL1BhcmVudCAyIDAgUgogICAgICAvUmVzb3VyY2VzCiAgICAgICA8PCAvRm9udAogICAgICAgICAgIDw8IC9GMQogICAgICAgICAgICAgICA8PCAvVHlwZSAvRm9udAogICAgICAgICAgICAgICAgICAvU3VidHlwZSAvVHlwZTEKICAgICAgICAgICAgICAgICAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgogICAgICAgICAgICAgICA+PgogICAgICAgICAgID4+CiAgICAgICA+PgogICAgICAvQ29udGVudHMgNCAwIFIKICA+PgplbmRvYmoKCjQgMCBvYmoKICA8PCAvTGVuZ3RoIDU1ID4+CnN0cmVhbQogIEJUCiAgICAvRjEgMTggVGYKICAgIDAgMCBUZAogICAgKFNhbXBsZSBPcmNoYXJkIFJlcG9ydCkgVGoKICBFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTggMDAwMDAgbiAKMDAwMDAwMDA3NyAwMDAwMCBuIAowMDAwMDAwMTc4IDAwMDAwIG4gCjAwMDAwMDA0NTcgMDAwMDAgbiAKdHJhaWxlcgogIDw8ICAvUm9vdCAxIDAgUgogICAgICAvU2l6ZSA1CiAgPj4Kc3RhcnR4cmVmCjU2NQolJUVPRgo=';
  
  let pdfSecureUrl = '';
  try {
    const pdfResult = await cloudinary.uploader.upload(dummyPdfBase64, {
      folder: 'kissan_mithar_seed_data',
      resource_type: 'raw',
      format: 'pdf',
      public_id: 'Sample_Orchard_Report'
    });
    pdfSecureUrl = pdfResult.secure_url;
    console.log(`✅ Uploaded PDF to: ${pdfSecureUrl}`);
  } catch (error) {
    console.error('❌ Failed to upload dummy PDF:', error);
  }

  // 4. Replace in seed.ts
  for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
    // Escape special characters in URL for regex just in case
    const safeOld = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safeOld, 'g');
    seedContent = seedContent.replace(regex, newUrl);
  }
  
  if (pdfSecureUrl) {
    const pdfRegex = /https:\/\/api\.kissanmithar\.in\/reports\/[^"']+\.pdf/g;
    seedContent = seedContent.replace(pdfRegex, pdfSecureUrl);
  }
  
  fs.writeFileSync(seedFilePath, seedContent, 'utf-8');
  console.log('✅ Successfully updated backend/prisma/seed.ts with Cloudinary URLs!');
}

migrate();
