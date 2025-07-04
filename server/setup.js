import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setup() {
  try {
    // Create uploads directory structure for images
    const imagesDir = join(__dirname, 'public/uploads/projects/images');
    await fs.mkdir(imagesDir, { recursive: true });
    console.log('Created images directory:', imagesDir);

    // Create uploads directory structure for videos
    const videosDir = join(__dirname, 'public/uploads/projects/videos');
    await fs.mkdir(videosDir, { recursive: true });
    console.log('Created videos directory:', videosDir);

    // Create a .gitignore in the uploads directory
    const gitignorePath = join(__dirname, 'public/uploads/.gitignore');
    await fs.writeFile(gitignorePath, '*\n!.gitignore\n');
    console.log('Created .gitignore in uploads directory');

    console.log('Setup completed successfully');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setup(); 