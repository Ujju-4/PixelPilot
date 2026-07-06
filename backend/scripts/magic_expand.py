"""
Magic Expand: extends an image's canvas and fills the new area.

True generative outpainting needs a diffusion model, which this environment can't
reach (no GPU, no model download path -- see README). As a real, working fallback,
this script extends the canvas by replicating edge pixels outward and then runs
OpenCV inpainting over the new border region, blending it with the original
content rather than leaving a hard-replicated edge. This works well for smooth or
textured surroundings (skies, walls, simple backgrounds); it will not invent new
scene content the way a generative model would.

Usage:
    python3 magic_expand.py <input_path> <output_path> <top> <right> <bottom> <left>
"""
import sys
import cv2
import numpy as np


def main() -> None:
    if len(sys.argv) < 7:
        print('Usage: magic_expand.py <input> <output> <top> <right> <bottom> <left>', file=sys.stderr)
        sys.exit(1)

    input_path, output_path = sys.argv[1], sys.argv[2]
    top, right, bottom, left = (int(x) for x in sys.argv[3:7])

    if min(top, right, bottom, left) < 0:
        print('Expand amounts must be non-negative.', file=sys.stderr)
        sys.exit(1)
    if top + right + bottom + left == 0:
        print('At least one side must have a non-zero expand amount.', file=sys.stderr)
        sys.exit(1)

    image = cv2.imread(input_path, cv2.IMREAD_COLOR)
    if image is None:
        print(f'Could not read image at {input_path}', file=sys.stderr)
        sys.exit(2)

    canvas = cv2.copyMakeBorder(image, top, bottom, left, right, cv2.BORDER_REPLICATE)

    mask = np.zeros(canvas.shape[:2], dtype=np.uint8)
    if top > 0:
        mask[:top, :] = 255
    if bottom > 0:
        mask[-bottom:, :] = 255
    if left > 0:
        mask[:, :left] = 255
    if right > 0:
        mask[:, -right:] = 255

    result = cv2.inpaint(canvas, mask, 9, cv2.INPAINT_TELEA)

    ok = cv2.imwrite(output_path, result)
    if not ok:
        print(f'Could not write output to {output_path}', file=sys.stderr)
        sys.exit(3)

    print('OK')


if __name__ == '__main__':
    main()
