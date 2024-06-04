const { default: ollama } = require('ollama');

export async function generateDescription(img:string) {

    const messages = [{
        role : 'system',
        content:  `You are an expert image description generator. 
        You are part of a critical system that looks at a desktop screenshot and provide a detailed description of what is the visual and written content in that screenshot.
        Make sure to output details of what website/ app user is potentially using, what is the content on the screen and what is it about. 
        Only provide the description, nothing else. Be breif yet cover all major aspects in the description.`,
    },
    {
        role : 'user',
        content : 'Generate description of the attached screenshot',
        images : [img]
    }]

    const desc = await ollama.chat({
        model : 'llava:v1.6',
        messages: messages
    })
    return desc
}

export async function generateEmbedding(desc:string) {
    const embedding = await ollama.embeddings({
        model : 'mxbai-embed-large:latest',
        prompt : desc,
    })
    return embedding
}