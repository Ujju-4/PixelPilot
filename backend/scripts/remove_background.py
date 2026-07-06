"""
Background removal via OpenCV GrabCut.

Why GrabCut and not a neural background-remover (e.g. rembg/U2Net):
U2Net's pretrained weights are fetched from a GitHub release asset at runtime.
In network-restricted deployments (no egress to release-assets.githubusercontent.com)
that download fails outright. GrabCut ships inside opencv-python itself — no model
download, no internet dependency — and is a real, classical, iterative segmentation
algorithm (Rother et al., 2004), not a placeholder. Quality is lower than a trained
neural matting network, especially on busy/low-contrast backgrounds, but the result
is real and the cutout is genuinely computed per-image.

Usage:
    python3 remove_background.py <input_path> <output_path> [background_mode]

background_mode:
    transparent           (default) alpha-cut PNG
    white                  composite over solid white
    color:RRGGBB           composite over a solid hex color
    gradient:RRGGBB:RRGGBB vertical two-color gradient background
"""
import sys
import cv2
import numpy as np


def parse_hex_color(hex_str: str):
    hex_str = hex_str.strip().lstrip('#')
    r = int(hex_str[0:2], 16)
    g = int(hex_str[2:4], 16)
    b = int(hex_str[4:6], 16)
    return (b, g, r)  # OpenCV uses BGR order


def compute_foreground_mask(bgr: np.ndarray) -> np.ndarray:
    height, width = bgr.shape[:2]

    # Seed GrabCut with a centered rectangle covering most of the frame, leaving a
    # margin so corner/edge pixels are treated as probable background. This is a
    # deterministic, content-agnostic initialization that works reasonably well for
    # product shots and portraits where the subject is roughly centered.
    margin_x = max(1, int(width * 0.06))
    margin_y = max(1, int(height * 0.06))
    rect = (margin_x, margin_y, width - 2 * margin_x, height - 2 * margin_y)

    mask = np.zeros((height, width), dtype=np.uint8)
    bgd_model = np.zeros((1, 65), dtype=np.float64)
    fgd_model = np.zeros((1, 65), dtype=np.float64)

    cv2.grabCut(bgr, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)

    # GC_FGD = 1 (definite foreground), GC_PR_FGD = 3 (probable foreground)
    foreground_mask = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)

    # Soften the cutout edge slightly so it doesn't look hard-clipped.
    foreground_mask = cv2.GaussianBlur(foreground_mask, (5, 5), 0)
    return foreground_mask


def composite_background(bgr: np.ndarray, alpha: np.ndarray, mode: str) -> np.ndarray:
    height, width = bgr.shape[:2]
    alpha_f = (alpha.astype(np.float32) / 255.0)[:, :, None]

    if mode == 'transparent':
        bgra = cv2.cvtColor(bgr, cv2.COLOR_BGR2BGRA)
        bgra[:, :, 3] = alpha
        return bgra

    if mode == 'white':
        background = np.full_like(bgr, 255, dtype=np.uint8)
    elif mode.startswith('color:'):
        color = parse_hex_color(mode.split(':', 1)[1])
        background = np.full_like(bgr, color, dtype=np.uint8)
    elif mode.startswith('gradient:'):
        _, c1, c2 = mode.split(':')
        top = np.array(parse_hex_color(c1), dtype=np.float32)
        bottom = np.array(parse_hex_color(c2), dtype=np.float32)
        ramp = np.linspace(0, 1, height, dtype=np.float32).reshape(height, 1, 1)
        gradient_row = top.reshape(1, 1, 3) * (1 - ramp) + bottom.reshape(1, 1, 3) * ramp
        background = np.repeat(gradient_row, width, axis=1).astype(np.uint8)
    else:
        raise ValueError(f'Unknown background mode: {mode}')

    composited = (bgr.astype(np.float32) * alpha_f + background.astype(np.float32) * (1 - alpha_f))
    return composited.astype(np.uint8)


def main() -> None:
    if len(sys.argv) < 3:
        print('Usage: remove_background.py <input> <output> [mode]', file=sys.stderr)
        sys.exit(1)

    input_path, output_path = sys.argv[1], sys.argv[2]
    mode = sys.argv[3] if len(sys.argv) > 3 else 'transparent'

    bgr = cv2.imread(input_path, cv2.IMREAD_COLOR)
    if bgr is None:
        print(f'Could not read image at {input_path}', file=sys.stderr)
        sys.exit(2)

    alpha = compute_foreground_mask(bgr)
    result = composite_background(bgr, alpha, mode)

    ok = cv2.imwrite(output_path, result)
    if not ok:
        print(f'Could not write output to {output_path}', file=sys.stderr)
        sys.exit(3)

    print('OK')


if __name__ == '__main__':
    main()
