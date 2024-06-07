import mlx.core as mx
from mlx_vlm import load, generate

model_path = "google/paligemma-3b-mix-448"
model, processor = load(model_path)

print(processor)

prompt = processor.tokenizer.apply_chat_template(
    [{"role": "user", "content": f"<image>\nWhat are these?"}],
    tokenize=False,
    add_generation_prompt=True,
)

output = generate(model, processor, "http://images.cocodataset.org/val2017/000000039769.jpg", prompt, verbose=False)