import { desktopCapturer } from 'electron';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

export const setupPeriodicScreenshot = () => {
    setInterval(() => {
      takeScreenshot();
    }, 5000);
};

const takeScreenshot = async () => {
    try {
        const sources = await desktopCapturer.getSources({ 
            types: ['screen'],
            thumbnailSize: {width: 1920, height: 1080}    
        });
        const source = sources[0];
      
        if (source && source.thumbnail) {
            const image = source.thumbnail.toPNG();
            const timestamp = new Date().getTime();
            const screenshotsDir = path.join(__dirname, 'screenshots');
            const screenshotPath = path.join(screenshotsDir, `${timestamp}.png`);

            // Ensure the directory exists
            if (!fs.existsSync(screenshotsDir)) {
                fs.mkdirSync(screenshotsDir, { recursive: true });
            }

            if (!(await isSignificantSimilarity(image, screenshotsDir))) //if there is significant similarity between the current ss and the last 10 - we do not save it. 
            {
                fs.writeFile(screenshotPath, image, (err) => {
                    if (err) return console.log(`Failed to save screenshot: ${err}`);
                    console.log(`Screenshot saved to ${screenshotPath}`);
                });
            }
        }
    } catch (error) {
        console.error('Error taking screenshot:', error);
    }
};
  
// Ensure the screenshots directory exists
fs.mkdir(path.join(__dirname, 'screenshots'), { recursive: true }, (err) => {
    if (err) console.log(`Failed to create screenshots directory: ${err}`);
});

//if there is significant similarity between the current ss and the last 10 - we do not save it. 
const isSignificantSimilarity = async (currentImage: Buffer, screenshotsDir: string): Promise<boolean> => {
    if (typeof screenshotsDir !== 'string') {
        console.error('Invalid path:', screenshotsDir);
        return false;
    }
    try {
        const files = await fs.promises.readdir(screenshotsDir);
        const recentFiles = files.filter(file => file.endsWith('.png')).slice(-10); // Get the last 10 PNG files

        // if there are no recent files (i.e screenshot dir is empty - take the screenshot)
        if (recentFiles.length == 0) {
            return false;
        }

        for (const file of recentFiles) {
            const lastImagePath = path.join(screenshotsDir, file);
            const lastImageBuffer = await fs.promises.readFile(lastImagePath);
            const lastImage = PNG.sync.read(lastImageBuffer);
            const current = PNG.sync.read(currentImage);

            let pixelDiffCount = 0;
            const step = 1; // Compare every other pixel for efficiency

            for (let y = 0; y < current.height; y += step) {
                for (let x = 0; x < current.width; x += step) {
                    const idx = (current.width * y + x) << 2;
                    if (current.data[idx] !== lastImage.data[idx] || // Red
                        current.data[idx + 1] !== lastImage.data[idx + 1] || // Green
                        current.data[idx + 2] !== lastImage.data[idx + 2] || // Blue
                        current.data[idx + 3] !== lastImage.data[idx + 3]) { // Alpha
                        pixelDiffCount++;
                    }
                }
            }

            const totalPixels = (current.width * current.height) / (step * step);
            const changePercentage = (pixelDiffCount / totalPixels) * 100;
            const similarityPercentage = 100 - changePercentage;

            if (similarityPercentage > 80) {
                // console.log(`Very similar with ${file}: ${similarityPercentage}% - so no SS`);
                return true;
                break;
            }
        }
        // console.log("No significant similarity detected - capturing SS")
        return false;
    } catch(error) {
        console.error('Failed to read directory:', error);
        return false;
    }
    
};
  
