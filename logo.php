<?php

header("Content-Type: image/svg+xml");

$color = "000000";
if (isset($_GET["color"])) {
    $color = $_GET["color"];

    if ($color == "random") {
        $color = str_pad(dechex(rand(0, 255)), 2, "0", STR_PAD_LEFT)
               . str_pad(dechex(rand(0, 255)), 2, "0", STR_PAD_LEFT)
               . str_pad(dechex(rand(0, 255)), 2, "0", STR_PAD_LEFT);
    }
}

$scale = 1;
if (isset($_GET["scale"])) {
    $scale = (float) $_GET["scale"];
}

$width = ceil($scale * 89);
$height = ceil($scale * 27);

echo '<?xml version="1.0" encoding="UTF-8" ?>';

?>

<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="<?php echo $width; ?>" height="<?php echo $height; ?>">
    <g transform="scale(<?php echo $scale; ?>)">
        <path style="fill:#<?php echo $color; ?>" d="m 0,0 0,21 5,0 0,-11 2,0 0,11 5,0 0,-15 -7,0 0,-6 -5,0 z m 28,0 0,4 5,0 0,-4 -5,0 z m 49,0 0,21 5,0 0,-11 2,0 0,11 5,0 0,-15 -7,0 0,-6 -5,0 z m -63,6 0,15 12,0 0,-4 -7,0 0,-2 7,0 0,-9 -12,0 z m 14,0 0,17 -2,0 0,4 7,0 0,-21 -5,0 z m 7,0 0,15 5,0 0,-11 2,0 0,11 5,0 0,-15 -12,0 z m 14,0 0,15 12,0 0,-15 -12,0 z m 14,0 0,4 7,0 0,2 -7,0 0,9 12,0 0,-15 -12,0 z m -44,4 2,0 0,2 -2,0 0,-2 z m 35,0 2,0 0,7 -2,0 0,-7 z m 14,5 2,0 0,2 -2,0 0,-2 z" />
    </g>
</svg>
