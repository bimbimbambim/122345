import replicate
import base64
import io
import httpx
from typing import Optional
from ..core.config import settings

STYLE_PROMPTS = {
    "street": "cinematic street style portrait, urban background, fashion editorial, soft natural light, professional photography, 8k, sharp focus",
    "business": "professional business portrait, studio lighting, corporate style, confident expression, formal attire, 8k, sharp focus",
    "cinematic": "cinematic portrait, dramatic lighting, movie still, depth of field, cinematic color grading, 35mm film, sharp focus",
    "instagram": "instagram influencer aesthetic portrait, golden hour lighting, lifestyle photography, warm tones, soft bokeh, 8k",
    "dark": "dark moody portrait, dramatic shadows, mysterious atmosphere, high contrast, dark aesthetic, neon accents, 8k",
    "vogue": "vogue magazine cover style portrait, high fashion editorial, professional studio lighting, luxury fashion, glossy magazine, 8k",
    "luxury": "luxury editorial portrait, haute couture, professional photographer, magazine quality, opulent setting, 8k ultra",
    "celebrity": "celebrity style portrait, glamour photography, star quality, professional styling, entertainment industry, 8k",
    "old_money": "old money aesthetic portrait, preppy style, aristocratic setting, timeless elegance, classic fashion, heritage brand, 8k",
    "red_carpet": "red carpet event portrait, evening gown, Hollywood glamour, professional photography, gala event, film premiere, 8k",
}

NEGATIVE_PROMPT = (
    "blurry, low quality, distorted face, bad anatomy, deformed, ugly, "
    "watermark, text, logo, nsfw, cartoon, anime, painting, illustration, "
    "multiple people, crowd, extra limbs, mutated hands"
)


async def generate_photo(
    style_id: str,
    tier: str,
    photo_base64: str,
) -> list[str]:
    """
    Generate AI photos using Replicate API with IP-Adapter for face consistency.
    """
    prompt = STYLE_PROMPTS.get(style_id, STYLE_PROMPTS["street"])

    quality_steps = {"fast": 20, "standard": 35, "premium": 50}.get(tier, 35)
    num_outputs = {"fast": 1, "standard": 2, "premium": 4}.get(tier, 2)

    image_data = base64.b64decode(photo_base64)

    try:
        output = await _run_ip_adapter(
            image_data=image_data,
            prompt=prompt,
            num_inference_steps=quality_steps,
            num_outputs=num_outputs,
        )
        return output
    except Exception:
        output = await _run_sdxl_fallback(
            prompt=prompt,
            num_inference_steps=quality_steps,
            num_outputs=num_outputs,
        )
        return output


async def _run_ip_adapter(
    image_data: bytes,
    prompt: str,
    num_inference_steps: int,
    num_outputs: int,
) -> list[str]:
    image_b64 = base64.b64encode(image_data).decode()
    image_uri = f"data:image/jpeg;base64,{image_b64}"

    output = replicate.run(
        settings.REPLICATE_IP_ADAPTER_MODEL,
        input={
            "image": image_uri,
            "prompt": prompt,
            "negative_prompt": NEGATIVE_PROMPT,
            "num_inference_steps": num_inference_steps,
            "guidance_scale": 7.5,
            "width": 768,
            "height": 1024,
            "num_outputs": num_outputs,
        },
    )

    urls = []
    for item in output:
        if hasattr(item, 'read'):
            urls.append(str(item))
        else:
            urls.append(str(item))
    return urls


async def _run_sdxl_fallback(
    prompt: str,
    num_inference_steps: int,
    num_outputs: int,
) -> list[str]:
    output = replicate.run(
        settings.REPLICATE_SDXL_MODEL,
        input={
            "prompt": f"professional portrait photo, {prompt}",
            "negative_prompt": NEGATIVE_PROMPT,
            "num_inference_steps": num_inference_steps,
            "guidance_scale": 7.5,
            "width": 768,
            "height": 1024,
            "num_outputs": num_outputs,
            "refine": "expert_ensemble_refiner",
            "scheduler": "K_EULER",
        },
    )

    urls = [str(item) for item in output]
    return urls


async def validate_face(photo_base64: str) -> bool:
    """Basic face validation - checks if image is decodable and has reasonable size."""
    try:
        from PIL import Image
        image_data = base64.b64decode(photo_base64)
        img = Image.open(io.BytesIO(image_data))
        width, height = img.size
        if width < 100 or height < 100:
            return False
        return True
    except Exception:
        return False


async def upload_to_storage(image_url: str, generation_id: str, idx: int) -> str:
    """Upload generated image to S3 or return original URL."""
    if not settings.AWS_ACCESS_KEY_ID:
        return image_url

    try:
        import boto3
        async with httpx.AsyncClient() as client:
            resp = await client.get(image_url, timeout=30)
            resp.raise_for_status()
            image_data = resp.content

        s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )

        key = f"generations/{generation_id}/{idx}.jpg"
        s3.put_object(
            Bucket=settings.AWS_BUCKET_NAME,
            Key=key,
            Body=image_data,
            ContentType="image/jpeg",
            ACL="public-read",
        )

        return f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
    except Exception:
        return image_url
