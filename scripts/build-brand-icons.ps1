$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$source = [System.Drawing.Image]::FromFile((Join-Path $root 'assets/logo.jpg'))

function Convert-LogoToPng([int]$size) {
    $bitmap = [System.Drawing.Bitmap]::new($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $stream = [System.IO.MemoryStream]::new()
    try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($source, 0, 0, $size, $size)
        $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
        return ,$stream.ToArray()
    }
    finally {
        $stream.Dispose()
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

try {
    if ($source.Width -ne $source.Height) {
        throw 'The brand logo must be square.'
    }
    foreach ($size in @(96, 192)) {
        [System.IO.File]::WriteAllBytes((Join-Path $root "assets/favicon-$size.png"), (Convert-LogoToPng $size))
    }
    [System.IO.File]::WriteAllBytes((Join-Path $root 'assets/apple-touch-icon.png'), (Convert-LogoToPng 180))

    # A single PNG-backed ICO keeps the conventional root fallback small.
    $png = Convert-LogoToPng 48
    $stream = [System.IO.MemoryStream]::new()
    $writer = [System.IO.BinaryWriter]::new($stream)
    try {
        $writer.Write([uint16]0)
        $writer.Write([uint16]1)
        $writer.Write([uint16]1)
        $writer.Write([byte]48)
        $writer.Write([byte]48)
        $writer.Write([byte]0)
        $writer.Write([byte]0)
        $writer.Write([uint16]1)
        $writer.Write([uint16]32)
        $writer.Write([uint32]$png.Length)
        $writer.Write([uint32]22)
        $writer.Write([byte[]]$png)
        $writer.Flush()
        [System.IO.File]::WriteAllBytes((Join-Path $root 'favicon.ico'), $stream.ToArray())
    }
    finally {
        $writer.Dispose()
        $stream.Dispose()
    }
}
finally {
    $source.Dispose()
}
