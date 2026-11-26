function createResultLeafAnimation(resultScreen) {
    const canvas = resultScreen.querySelector(".quiz-result-leaves");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const image = new Image();
    const loopDuration = 116000 * 6;
    let frame;
    let sizeChanged = true;

    const leaves = resultLeafBounds.map(([x, y, width, height]) => {
        const size = Math.max(width, height);
        return {
            x, y, width, height,
            laps: size < 36 ? 5 : size < 52 ? 6 : 7,
            sway: 3 + Math.random() * 5,
            tilt: (4 + Math.random() * 4) * Math.PI / 180,
            swings: Math.round(loopDuration / (7000 + Math.random() * 6000)),
            phase: Math.random() * 2 * Math.PI,
        };
    });

    function update() {
        cancelAnimationFrame(frame);
        canvas.classList.remove("is-animated");
        canvas.width = 0;
        if (resultScreen.hidden || reducedMotion.matches) return;

        if (!image.src) image.src = "./assets/Blader-BG-Element.svg";
        if (!image.naturalWidth) return;

        const context = canvas.getContext("2d");
        const atlas = document.createElement("canvas");
        const atlasContext = atlas.getContext("2d");
        if (!context || !atlasContext) return;

        let startedAt;
        let pixelRatio;
        let sprites;
        sizeChanged = true;

        function draw(now) {
            const nextPixelRatio = Math.min(devicePixelRatio, 2);
            if (sizeChanged || pixelRatio !== nextPixelRatio) {
                pixelRatio = nextPixelRatio;
                const tileHeight = Number.parseFloat(getComputedStyle(canvas).backgroundSize.split(" ")[1]);
                canvas.width = Math.round(canvas.clientWidth * pixelRatio);
                canvas.height = Math.round(canvas.clientHeight * pixelRatio);
                atlas.height = Math.round(tileHeight * pixelRatio);
                atlas.width = Math.round(atlas.height * image.naturalWidth / image.naturalHeight);
                if (!canvas.width || !canvas.height || !atlas.height) return;

                const scaleX = atlas.width / 1518.2;
                const scaleY = atlas.height / 908.6;
                const inset = (atlas.width - canvas.width) / 2;
                const firstTile = Math.floor(inset / atlas.width);
                const lastTile = Math.ceil((inset + canvas.width) / atlas.width);
                const tileOffsets = Array.from({ length: lastTile - firstTile },
                    (_, index) => (firstTile + index) * atlas.width - inset);
                atlasContext.drawImage(image, 0, 0, atlas.width, atlas.height);
                sprites = leaves.flatMap(leaf => {
                    const sourceX = Math.max(1, Math.floor((leaf.x - 2) * scaleX));
                    const sourceY = Math.max(1, Math.floor((leaf.y - 2) * scaleY));
                    return tileOffsets.map(tileOffset => ({
                        ...leaf,
                        sourceX,
                        sourceY,
                        left: sourceX + tileOffset,
                        width: Math.ceil((leaf.x + leaf.width + 2) * scaleX) - sourceX + 1,
                        height: Math.ceil((leaf.y + leaf.height + 2) * scaleY) - sourceY + 1,
                    }));
                }).filter(leaf => {
                    const reach = leaf.sway * pixelRatio + leaf.height * leaf.tilt / 2;
                    return leaf.left < canvas.width + reach && leaf.left + leaf.width > -reach;
                });

                sizeChanged = false;
                canvas.classList.add("is-animated");
            }

            startedAt ??= now;
            const progress = ((now - startedAt) % loopDuration) / loopDuration;
            context.clearRect(0, 0, canvas.width, canvas.height);
            for (const leaf of sprites) {
                drawLeaf(context, atlas, leaf, progress, pixelRatio, canvas.height);
            }
            context.resetTransform();
            frame = requestAnimationFrame(draw);
        }

        frame = requestAnimationFrame(draw);
    }

    const observer = new ResizeObserver(() => {
        sizeChanged = true;
    });
    observer.observe(canvas);
    reducedMotion.addEventListener("change", update);
    image.addEventListener("load", update);
    return update;
}

function drawLeaf(context, atlas, leaf, progress, pixelRatio, visibleHeight) {
    const phase = progress * leaf.swings * 2 * Math.PI + leaf.phase;
    const x = leaf.left + Math.sin(phase) * leaf.sway * pixelRatio;
    const left = Math.floor(x);
    const sourceX = leaf.sourceX - (x - left);
    // La bladet tippe litt etter sidebevegelsen.
    const angle = Math.sin(phase - Math.PI / 3) * leaf.tilt;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const halfWidth = leaf.width / 2;
    const halfHeight = leaf.height / 2;
    const verticalReach = Math.abs(sin) * halfWidth;
    const offset = leaf.sourceY + progress * leaf.laps * atlas.height;
    let y = offset % atlas.height - atlas.height;

    // Ta med kopien fra forrige repetisjon mens bladet passerer kanten.
    for (; y < visibleHeight + verticalReach; y += atlas.height) {
        if (y + leaf.height + verticalReach <= 0) continue;
        const top = Math.floor(y);
        // Behold pikselbrøkdelen i kilderektangelet for jevn bevegelse ved vanlig zoom.
        const sourceY = leaf.sourceY - (y - top);
        context.setTransform(cos, sin, -sin, cos, left + halfWidth, top + halfHeight);
        context.drawImage(atlas, sourceX, sourceY, leaf.width, leaf.height,
            -halfWidth, -halfHeight, leaf.width, leaf.height);
    }
}

// Rammene til de enkelte bladene i originalens SVG-koordinater, uten strek.
const resultLeafBounds = [
    [458.45, 231.9, 39.55, 50.48],
    [701.45, 86.6, 39.45, 50.48],
    [585.6, 409, 51.5, 29.44],
    [475.3, 105.5, 51.5, 29.44],
    [385.7, 38.64, 52.4, 35.86],
    [532.97, 309.4, 34.43, 48.4],
    [483.97, 403.3, 34.43, 48.4],
    [686.9, 260.2, 48.21, 47.5],
    [563.48, 64.2, 34.95, 64],
    [542.48, 215.53, 50.32, 35.97],
    [679.59, 363.5, 24.87, 37.9],
    [713.29, 187.8, 24.87, 37.9],
    [631.88, 285.29, 21.82, 21.01],
    [611.78, 146.39, 21.82, 21.01],
    [654.2, 20.98, 22.87, 19.62],
    [465, 323.32, 25.3, 16.87],
    [405.44, 397.2, 17.04, 26.4],
    [417.34, 190.6, 16.94, 26.4],
    [519.14, 5.8, 17.04, 26.4],
    [72.85, 226.6, 39.55, 50.38],
    [315.75, 81.3, 39.55, 50.38],
    [199.9, 403.7, 51.5, 29.34],
    [89.6, 100.2, 51.5, 29.34],
    [0.1, 33.34, 52.4, 35.76],
    [147.37, 304, 34.43, 48.5],
    [98.27, 397.9, 34.43, 48.5],
    [301.2, 254.8, 48.21, 47.5],
    [177.88, 58.8, 34.95, 64],
    [156.78, 210.13, 50.42, 35.97],
    [293.99, 358.1, 24.87, 37.9],
    [327.69, 182.5, 24.87, 37.8],
    [246.18, 279.89, 21.82, 21.01],
    [226.18, 141.09, 21.82, 21.01],
    [268.5, 15.68, 22.87, 19.62],
    [79.3, 318.02, 25.3, 16.77],
    [19.84, 391.8, 16.94, 26.5],
    [31.64, 185.2, 17.04, 26.5],
    [133.54, 0.4, 16.94, 26.5],
    [1198.75, 236.1, 39.55, 50.48],
    [1441.75, 90.8, 39.45, 50.48],
    [1325.9, 413.2, 51.5, 29.44],
    [1215.6, 109.7, 51.5, 29.44],
    [1126, 42.84, 52.4, 35.86],
    [1273.27, 313.6, 34.43, 48.4],
    [1224.27, 407.5, 34.43, 48.4],
    [1427.1, 264.4, 48.31, 47.5],
    [1303.78, 68.4, 34.95, 64],
    [1282.78, 219.73, 50.32, 35.97],
    [1419.89, 367.7, 24.87, 37.9],
    [1453.59, 192, 24.87, 37.9],
    [1372.08, 289.49, 21.92, 21.01],
    [1352.08, 150.59, 21.82, 21.01],
    [1394.5, 25.18, 22.87, 19.62],
    [1205.3, 327.52, 25.3, 16.87],
    [1145.74, 401.4, 17.04, 26.4],
    [1157.64, 194.8, 16.94, 26.4],
    [1259.44, 10, 16.94, 26.4],
    [813.15, 230.8, 39.55, 50.38],
    [1056.05, 85.5, 39.55, 50.38],
    [940.2, 407.9, 51.5, 29.34],
    [829.9, 104.4, 51.5, 29.34],
    [740.4, 37.54, 52.4, 35.76],
    [887.67, 308.2, 34.43, 48.5],
    [838.57, 402.1, 34.43, 48.4],
    [1041.5, 259, 48.21, 47.5],
    [918.18, 63, 34.95, 64],
    [897.08, 214.33, 50.32, 35.97],
    [1034.29, 362.3, 24.87, 37.9],
    [1067.99, 186.7, 24.87, 37.8],
    [986.48, 284.09, 21.82, 21.01],
    [966.38, 145.29, 21.92, 21.01],
    [1008.8, 19.88, 22.87, 19.62],
    [819.6, 322.12, 25.3, 16.87],
    [760.14, 396, 16.94, 26.5],
    [771.94, 189.4, 17.04, 26.5],
    [873.84, 4.6, 16.94, 26.5],
    [495.45, 684.6, 39.55, 50.48],
    [738.35, 539.3, 39.55, 50.48],
    [622.6, 861.7, 51.5, 29.44],
    [512.3, 558.2, 51.4, 29.44],
    [422.7, 491.34, 52.4, 35.76],
    [569.97, 762.1, 34.43, 48.4],
    [520.97, 856, 34.33, 48.4],
    [723.8, 712.9, 48.31, 47.5],
    [600.48, 516.9, 34.95, 64],
    [579.48, 668.13, 50.32, 35.97],
    [716.59, 816.2, 24.87, 37.9],
    [750.29, 640.5, 24.87, 37.9],
    [668.78, 737.99, 21.92, 21.01],
    [648.78, 599.09, 21.82, 21.01],
    [691.2, 473.68, 22.87, 19.62],
    [502, 776.02, 25.3, 16.87],
    [442.44, 849.9, 16.94, 26.4],
    [454.34, 643.3, 16.94, 26.4],
    [556.14, 458.5, 16.94, 26.4],
    [109.85, 679.3, 39.55, 50.38],
    [352.75, 534, 39.55, 50.38],
    [236.9, 856.4, 51.5, 29.34],
    [126.6, 552.9, 51.5, 29.34],
    [37.1, 486.04, 52.4, 35.76],
    [184.37, 756.7, 34.43, 48.5],
    [135.27, 850.6, 34.43, 48.4],
    [338.2, 707.5, 48.21, 47.5],
    [214.88, 511.5, 34.95, 64],
    [193.78, 662.83, 50.32, 35.97],
    [330.99, 810.8, 24.77, 37.9],
    [364.69, 635.1, 24.77, 37.9],
    [283.18, 732.59, 21.82, 21.01],
    [263.08, 593.69, 21.92, 21.11],
    [305.5, 468.38, 22.87, 19.52],
    [116.3, 770.62, 25.3, 16.87],
    [56.84, 844.5, 16.94, 26.4],
    [68.64, 637.9, 17.04, 26.4],
    [170.54, 453.1, 16.94, 26.4],
    [1235.75, 688.8, 39.55, 50.48],
    [1478.65, 543.5, 39.55, 50.48],
    [1362.9, 865.9, 51.5, 29.44],
    [1252.6, 562.4, 51.4, 29.44],
    [1163, 495.54, 52.4, 35.76],
    [1310.27, 766.3, 34.43, 48.4],
    [1261.27, 860.2, 34.33, 48.4],
    [1464.1, 717.1, 48.31, 47.5],
    [1340.78, 521.1, 34.95, 64],
    [1319.78, 672.33, 50.32, 35.97],
    [1456.89, 820.4, 24.87, 37.9],
    [1490.59, 644.7, 24.87, 37.9],
    [1409.08, 742.19, 21.92, 21.01],
    [1389.08, 603.29, 21.82, 21.01],
    [1431.5, 477.88, 22.87, 19.62],
    [1242.3, 780.22, 25.3, 16.87],
    [1182.74, 854.1, 16.94, 26.4],
    [1194.64, 647.5, 16.94, 26.4],
    [1296.44, 462.7, 16.94, 26.4],
    [850.15, 683.5, 39.55, 50.38],
    [1093.05, 538.1, 39.55, 50.48],
    [977.2, 860.6, 51.5, 29.34],
    [866.9, 557.1, 51.5, 29.34],
    [777.4, 490.24, 52.4, 35.76],
    [924.67, 760.9, 34.43, 48.5],
    [875.57, 854.8, 34.43, 48.4],
    [1078.5, 711.7, 48.21, 47.5],
    [955.18, 515.7, 34.95, 64],
    [934.08, 667.03, 50.32, 35.97],
    [1071.29, 815, 24.77, 37.9],
    [1104.99, 639.3, 24.77, 37.9],
    [1023.48, 736.79, 21.82, 21.01],
    [1003.38, 597.89, 21.92, 21.01],
    [1045.8, 472.48, 22.87, 19.62],
    [856.6, 774.82, 25.3, 16.87],
    [797.14, 848.7, 16.94, 26.4],
    [808.94, 642.1, 17.04, 26.4],
    [910.74, 457.3, 17.04, 26.4],
];
