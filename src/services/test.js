const Replicate = require('replicate')
const fs = require('fs')
const replicate = new Replicate();


// async function describeImage() {
//     const imageBuffer = fs.readFileSync('/Users/nischalj10/Desktop/rename.png')
//                 // generate img description
//     const img = imageBuffer.toString('base64');
//     //print(img)
//     const input = {
//         top_k: 1,
//         top_p: 1,
//         prompt: "please describe this image.",
//         //image_url: ["https://support.content.office.net/en-us/media/3dd2b79b-9160-403d-9967-af893d17b580.png"],
//         max_tokens: 45000,
//         temperature: 0.1,
//         image_base64: [img],
//         system_prompt: "You are a helpful AI assistant.",
//         max_new_tokens: 100,
//         repetition_penalty: 1.1
//     };
    
//     // for await (const event of replicate.stream("hayooucom/vision-model:6afc892d5aa00e0e0883dec30f7a766fcf515c64090def9d173093ac343c2438", { input })) {
//     //   // event: { event: string; data: string; id: string }
//     //   process.stdout.write(`${event}`)
//     //   //=> ""
//     // };
//     //process.stdout.write("\n");

//     const output = await replicate.run("hayooucom/vision-model:6afc892d5aa00e0e0883dec30f7a766fcf515c64090def9d173093ac343c2438", { input });
//     console.log(output.join(""));

    
// }

export async function generateDescription(img:string) {
    const replicate = new Replicate({
        auth: 'r8_KFxedtCRB9DTN4w9IhxI98emgDkNF1l27iqtA'
    });

    const input = {
        top_k: 1,
        top_p: 1,
        prompt: "please describe this image.",
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

const imageBuffer = fs.readFileSync('/Users/nischalj10/Desktop/rename.png')
const img = imageBuffer.toString('base64');
generateDescription(img);

//=> "The chart is a spreadsheet table with data organized int...