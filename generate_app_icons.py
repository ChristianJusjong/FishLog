import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

ASSETS_DIR = r"c:\ClaudeCodeProject\FishLog\apps\mobile\assets"

def create_app_icon(size=1024):
    # 1. Create Base Background with gradient
    img = Image.new("RGBA", (size, size), (7, 21, 36, 255))
    draw = ImageDraw.Draw(img)

    # Draw radial-like gradient layers
    center = size // 2
    for r in range(size, 0, -4):
        factor = r / size
        # From #071524 to #0E2A47
        r_val = int(7 + (14 - 7) * (1 - factor))
        g_val = int(21 + (42 - 21) * (1 - factor))
        b_val = int(36 + (71 - 36) * (1 - factor))
        draw.ellipse([center - r//2, center - r//2, center + r//2, center + r//2], fill=(r_val, g_val, b_val, 255))

    # 2. Outer glowing ring (Cyan / Teal)
    ring_radius = int(size * 0.42)
    ring_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ring_draw = ImageDraw.Draw(ring_img)
    ring_draw.ellipse(
        [center - ring_radius, center - ring_radius, center + ring_radius, center + ring_radius],
        outline=(0, 212, 178, 90),
        width=int(size * 0.012)
    )
    # Blur the ring for glow
    glow_ring = ring_img.filter(ImageFilter.GaussianBlur(radius=int(size * 0.02)))
    img.paste(glow_ring, (0, 0), glow_ring)
    img.paste(ring_img, (0, 0), ring_img)

    # 3. Draw Authentic Forged J-Hook in Gold (#F5A623 & #FFB800)
    hook_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    hook_draw = ImageDraw.Draw(hook_img)

    scale = size / 1024.0
    
    # Eyelet center at (540, 260)
    eye_cx = int(550 * scale)
    eye_cy = int(270 * scale)
    eye_r = int(45 * scale)
    eye_w = int(26 * scale)

    # Outer eyelet
    hook_draw.ellipse([eye_cx - eye_r, eye_cy - eye_r, eye_cx + eye_r, eye_cy + eye_r], fill=(255, 184, 0, 255))
    # Inner hole
    inner_r = eye_r - eye_w
    hook_draw.ellipse([eye_cx - inner_r, eye_cy - inner_r, eye_cx + inner_r, eye_cy + inner_r], fill=(0, 0, 0, 0))

    # Shank (Vertical line from (550, 270) down to (550, 620))
    shank_x = eye_cx
    shank_top = eye_cy + inner_r
    shank_bottom = int(600 * scale)
    shank_w = int(32 * scale)
    hook_draw.line([(shank_x, shank_top), (shank_x, shank_bottom)], fill=(255, 184, 0, 255), width=shank_w)

    # Bend (Curving from (550, 600) around (410, 600) to (310, 520))
    # Draw thick arc
    arc_box = [int(270 * scale), int(420 * scale), shank_x + shank_w // 2, int(720 * scale)]
    hook_draw.arc(arc_box, start=0, end=180, fill=(245, 166, 35, 255), width=shank_w)

    # Point & Barb (from bend left side going up-right)
    point_start_x = int(270 * scale) + shank_w // 2
    point_start_y = int(570 * scale)
    point_end_x = int(270 * scale) + shank_w // 2
    point_end_y = int(410 * scale)

    # Upward spear of hook
    hook_draw.line([(point_start_x, point_start_y), (point_end_x, point_end_y)], fill=(255, 184, 0, 255), width=shank_w)

    # Sharp needle tip triangle
    tip_pts = [
        (point_end_x - shank_w // 2, point_end_y + 10),
        (point_end_x + shank_w // 2, point_end_y + 10),
        (point_end_x, point_end_y - int(35 * scale))
    ]
    hook_draw.polygon(tip_pts, fill=(255, 215, 0, 255))

    # Barb (small spike pointing down-right inside the bend)
    barb_pts = [
        (point_end_x + shank_w // 4, point_end_y + int(30 * scale)),
        (point_end_x + int(48 * scale), point_end_y + int(70 * scale)),
        (point_end_x + shank_w // 4, point_end_y + int(85 * scale))
    ]
    hook_draw.polygon(barb_pts, fill=(255, 184, 0, 255))

    # Hook Shadow / Glow
    hook_glow = hook_img.filter(ImageFilter.GaussianBlur(radius=int(18 * scale)))
    img.paste(hook_glow, (0, 0), hook_glow)
    img.paste(hook_img, (0, 0), hook_img)

    # 4. Text "HOOK"
    text_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    text_draw = ImageDraw.Draw(text_img)
    
    # Draw modern custom HOOK lettering
    # H O O K at bottom
    text_y = int(760 * scale)
    font_size = int(110 * scale)
    
    try:
        font = ImageFont.truetype("arialbd.ttf", font_size)
    except:
        font = ImageFont.load_default()

    text_str = "HOOK"
    bbox = text_draw.textbbox((0, 0), text_str, font=font)
    tw = bbox[2] - bbox[0]
    tx = (size - tw) // 2

    # Draw gold text
    text_draw.text((tx, text_y), text_str, fill=(255, 255, 255, 255), font=font)

    # Add subtitle "SMART ANGLING"
    sub_font_size = int(28 * scale)
    try:
        sub_font = ImageFont.truetype("arialbd.ttf", sub_font_size)
    except:
        sub_font = ImageFont.load_default()
    
    sub_str = "S M A R T   A N G L I N G"
    sub_bbox = text_draw.textbbox((0, 0), sub_str, font=sub_font)
    sub_tw = sub_bbox[2] - sub_bbox[0]
    sub_tx = (size - sub_tw) // 2
    text_draw.text((sub_tx, text_y + font_size + int(15 * scale)), sub_str, fill=(0, 212, 178, 230), font=sub_font)

    img.paste(text_img, (0, 0), text_img)
    return img

def main():
    print("Generating Hook Brand App Assets...")
    
    # 1. Main App Icon 1024x1024
    icon = create_app_icon(1024)
    icon.save(os.path.join(ASSETS_DIR, "icon.png"), "PNG")
    print("Saved icon.png")

    # 2. Android Adaptive Icon 1024x1024
    adaptive = create_app_icon(1024)
    adaptive.save(os.path.join(ASSETS_DIR, "adaptive-icon.png"), "PNG")
    print("Saved adaptive-icon.png")

    # 3. Splash Screen (1242 x 2436)
    splash_w, splash_h = 1242, 2436
    splash = Image.new("RGBA", (splash_w, splash_h), (7, 21, 36, 255))
    
    # Center icon on splash
    icon_800 = create_app_icon(800)
    pos_x = (splash_w - 800) // 2
    pos_y = (splash_h - 800) // 2
    splash.paste(icon_800, (pos_x, pos_y), icon_800)
    splash.save(os.path.join(ASSETS_DIR, "splash.png"), "PNG")
    print("Saved splash.png")

    # 4. Favicon (48x48)
    favicon = icon.resize((48, 48), Image.Resampling.LANCZOS)
    favicon.save(os.path.join(ASSETS_DIR, "favicon.png"), "PNG")
    print("Saved favicon.png")

    print("All assets successfully generated!")

if __name__ == "__main__":
    main()
