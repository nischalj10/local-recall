import Replicate from 'replicate'
import {Ollama} from 'ollama'
import { OpenAI } from 'openai';
import dotenv from 'dotenv'

const ollama = new Ollama()
dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION
})

export async function generateDescription(img:string) {
    // Todo: This is temporary as the local model is buggy. Check prev commit. Putting api key here becuase of hurry to demo :) 
    const replicate = new Replicate({
        auth: process.env.REPLICATE_AUTH   
    });
    const input = {
        top_k: 1,
        top_p: 1,
        prompt: `You are an expert image description generator. 
        You are part of a critical system that looks at screenshots and provide a detailed description of what is the visual and written content in that screenshot.
        Correctly identify the app/ website present in the screenshot. 
        Give a description of what is the content on the screen and what is it about. 
        Think long before you respond and be highy accurate`,
        max_tokens: 45000,
        temperature: 0.1,
        image_base64: [img],
        system_prompt: "You are a helpful AI assistant.",
        max_new_tokens: 250,
        repetition_penalty: 1.1
    };

    // let description = '';
    // for await (const event of replicate.stream("hayooucom/vision-model:6afc892d5aa00e0e0883dec30f7a766fcf515c64090def9d173093ac343c2438", { input })) {
    //     description += event;
    // }

    const descriptionArray = await replicate.run("hayooucom/vision-model:6afc892d5aa00e0e0883dec30f7a766fcf515c64090def9d173093ac343c2438", { input });
    const description = (descriptionArray as string[]).join("");
    return description;
}

export async function generateEmbedding(desc:string) {
    // const embedding = await ollama.embeddings({
    //     model : 'mxbai-embed-large:latest',
    //     prompt : desc,
    // })
    // console.log(embedding)
    // return embedding
    // TODO: This is temporary to test the querality of local models
    const embedding = await openai.embeddings.create({input: desc, model: 'text-embedding-3-small'})
    console.log(embedding)
    return embedding.data[0]
}