import { desktopCapturer } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os'
import { generateDescription, generateEmbedding } from './embedding';
import { addToDB } from './vectordb';
import sharp from 'sharp';

const appDataPath = path.join(os.homedir(), 'app-data', 'local-recall');
const screenshotsDir = path.join(appDataPath, 'screenshots');
let screenshotQueue: {path: string, timestamp: number}[] = []

export const setupPeriodicScreenshot = () => {
    setInterval(() => takeScreenshotAndStore(), 5000);
};

const takeScreenshotAndStore = async () => {
    try {
        const sources = await desktopCapturer.getSources({ 
            types: ['screen'],
            thumbnailSize: {width: 1920, height: 1080}    
        });
        const source = sources[0];
      
        if (source && source.thumbnail) {
            const image = source.thumbnail.toPNG();
            const timestamp = new Date().getTime();
            const screenshotPath = path.join(screenshotsDir, `${timestamp}.png`);

            // ensure the directory exists
            if (!fs.existsSync(screenshotsDir)) {
                fs.mkdirSync(screenshotsDir, { recursive: true });
            }
            
            // if there is significant similarity between the current ss and the last 50 - we do not save it. 
            if (!(await isSignificantSimilarity(image, screenshotsDir))) {
                
                //save screenshot
                fs.writeFile(screenshotPath, image, (err) => {
                    // Todo naman:  screenshot can be compressed while saving and again decompressed while fetching to save disk space
                    if (err) {
                        console.log(`Failed to save screenshot: ${err}`);
                        return;
                    }
                    // Check the size of the saved image file
                    fs.stat(screenshotPath, (err, stats) => {
                        if (err) {
                            console.error(`Failed to get file stats: ${err}`);
                            return;
                        }
                        
                        if (stats.size === 0) {
                            // If the file size is 0 KB, delete the file
                            fs.unlink(screenshotPath, (err) => {
                                if (err) {
                                    console.error(`Failed to delete empty file: ${err}`);
                                } else {
                                    console.warn(`Deleted empty file: ${screenshotPath}`);
                                }
                            });
                        } else {
                            console.log(`Screenshot saved to ${screenshotPath}`);
                            // Add to queue for batch processing later. 
                            screenshotQueue.push({path: screenshotPath, timestamp: timestamp});
                        }
                    });
                });  
            }
        }
    } catch (error) {
        console.error('Error taking screenshot:', error);
    }
};

// Ensure the screenshots directory exists
fs.mkdir(screenshotsDir, { recursive: true }, (err) => {
    if (err) console.log(`Failed to create screenshots directory: ${err}`);
});

//if there is significant similarity between the current ss and the last 50 - we do not save it. 
const isSignificantSimilarity = async (currentImage: Buffer, screenshotsDir: string): Promise<boolean> => {
    if (typeof screenshotsDir !== 'string') {
        console.error('Invalid path:', screenshotsDir);
        return false;
    }
    try {
        const files = await fs.promises.readdir(screenshotsDir);
        const recentFiles = files.filter(file => file.endsWith('.png')).slice(-50); // Get the last 50 PNG files

        // if there are no recent files (i.e screenshot dir is empty - take the screenshot)
        if (recentFiles.length == 0) {
            return false;
        }

        for (const file of recentFiles) {
            const lastImagePath = path.join(screenshotsDir, file);
            const lastImageBuffer = await fs.promises.readFile(lastImagePath);
            const lastImage = await sharp(lastImageBuffer).raw().toBuffer({ resolveWithObject: true });
            const current = await sharp(currentImage).raw().toBuffer({ resolveWithObject: true });

            let pixelDiffCount = 0;
            const step = 1; // Compare every other pixel for efficiency

            for (let y = 0; y < current.info.height; y += step) {
                for (let x = 0; x < current.info.width; x += step) {
                    const idx = (current.info.width * y + x) << 2;
                    if (current.data[idx] !== lastImage.data[idx] || // Red
                        current.data[idx + 1] !== lastImage.data[idx + 1] || // Green
                        current.data[idx + 2] !== lastImage.data[idx + 2] || // Blue
                        current.data[idx + 3] !== lastImage.data[idx + 3]) { // Alpha
                        pixelDiffCount++;
                    }
                }
            }

            const totalPixels = (current.info.width * current.info.height) / (step * step);
            const changePercentage = (pixelDiffCount / totalPixels) * 100;
            const similarityPercentage = 100 - changePercentage;

            if (similarityPercentage > 75) {
                console.log(`Very similar with ${file}: ${similarityPercentage}% - so no SS`);
                return true;
            }
        }
        //console.log("No significant similarity detected - capturing SS")
        return false;
    } catch(error) {
        console.error('Failed to read directory:', error);
        return false;
    }
};

export const processScreenshotQueue = async() => {
    while(true) {
        if (screenshotQueue.length > 0) {
            try {
                const ss = screenshotQueue.shift()
                console.log('Processing ss - ', ss.path)
                const imageBuffer = fs.readFileSync(ss.path)
                // generate img description
                const img = imageBuffer.toString('base64');
                const desc = await generateDescription(img);
                //console.log(desc.message.content)
                console.log(desc)

                // generate embedding of description
                //const emb = await generateEmbedding(desc.message.content)
                const emb = await generateEmbedding(desc)

                // save embeddings to db
                try {
                    //await addToDB(ss.path, desc.message.content, emb)
                    await addToDB(ss.path, desc, emb)
                    console.log("saved to vector db")
                } catch (err) {
                    console.log(err)
                }
            } catch (error) {
                console.log("Error processing screenshot queue", error)
            }

        } else {
            // wait for 5 seconds if queue is empty  
            await new Promise(resolve => setTimeout(resolve, 5000))
        }
    }
}
  
