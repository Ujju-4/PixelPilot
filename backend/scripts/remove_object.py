"""
Object removal via OpenCV inpainting.

The user paints over the unwanted object in the browser; the brush strokes are
sent as a black/white mask (white = remove & fill, black = keep). This script
runs Telea's fast marching inpainting algorithm (Telea, 2004) to reconstruct the
masked region from surrounding pixels. It's classical CV, not a generative model,
but it's a real, complete algorithm and works well for masks that are reasonably
small relative to their surroundings (e.g. removing a blemish, wire, or stray
object from a fairly uniform or textured background).

Usage:
    python3 remove_object.py <input_path> <mask_path> <output_path>
"""
import sys
import cv2
import numpy as np


def main() -> None:
    if len(sys.argv) < 4:
        print('Usage: remove_object.py <input> <mask> <output>', file=sys.stderr)
        sys.exit(1)

    input_path, mask_path, output_path = sys.argv[1], sys.argv[2], sys.argv[3]

    image = cv2.imread(input_path, cv2.IMREAD_COLOR)
    if image is None:
        print(f'Could not read image at {input_path}', file=sys.stderr)
        sys.exit(2)

    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    if mask is None:
        print(f'Could not read mask at {mask_path}', file=sys.stderr)
        sys.exit(2)

    if mask.shape[:2] != image.shape[:2]:
        mask = cv2.resize(mask, (image.shape[1], image.shape[0]), interpolation=cv2.INTER_NEAREST)

    # Binarize: anything reasonably bright counts as "paint here".
    _, binary_mask = cv2.threshold(mask, 80, 255, cv2.THRESH_BINARY)

    if cv2.countNonZero(binary_mask) == 0:
        print('Mask is empty -- nothing to remove.', file=sys.stderr)
        sys.exit(3)

    # Slightly dilate so the inpainting boundary fully covers the brushed edge,
    # avoiding a thin halo of the original object remaining visible.
    kernel = np.ones((3, 3), np.uint8)
    binary_mask = cv2.dilate(binary_mask, kernel, iterations=2)

    result = cv2.inpaint(image, binary_mask, 7, cv2.INPAINT_TELEA)

    ok = cv2.imwrite(output_path, result)
    if not ok:
        print(f'Could not write output to {output_path}', file=sys.stderr)
        sys.exit(4)

    print('OK')


if __name__ == '__main__':
    main()
