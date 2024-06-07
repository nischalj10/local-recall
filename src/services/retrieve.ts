import { generateEmbedding } from "./embedding";
import {searchDB} from "./vectordb"


export async function processQuery(query: string): Promise<{imagePath: string, imageDesc: string, timestamp: string}> {
    try {
        // Generate embedding 
        const emb = await generateEmbedding(query)
        // Get results from db 
        const result = await searchDB(emb)
        console.log(result)
        // Return the path and timestamp
        return {
            imagePath: result[0].ss_path,
            imageDesc: result[0].ss_desc,
            timestamp: result[0].timestamp
        }
    } catch (error) {
        console.error('An error occurrred while processing the query')
        throw error
    }
}