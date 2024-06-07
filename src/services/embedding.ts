const { default: ollama } = require('ollama');

export async function generateDescription(img:string) {

    const messages = [{
        role : 'system',
        content:  `You are an expert image description generator. 
        You are part of a critical system that looks at screenshots and provide a detailed description of what is the visual and written content in that screenshot.
        Correctly identify the app/ website present in the screenshot. 
        Give a description of what is the content on the screen and what is it about. 
        Think long before you respond and be highy accurate`,
    },
    {
        role : 'user',
        content : 'Generate description of the attached screenshot',
        images : [img]
    }]

    const desc = await ollama.chat({
        model : 'minicpm-v2.5-small',
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