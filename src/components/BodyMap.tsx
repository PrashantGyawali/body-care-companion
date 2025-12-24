import { useEffect, useRef, useState } from "react";
import imageMapResize from "image-map-resizer";
import { bodyParts } from "@/utils/body-parts";

interface BodyPart {
    id: string;
    title: string;
    coords: number[];
}

const ORIGINAL_WIDTH = 720;
const ORIGINAL_HEIGHT = 789;


export function BodyMap({ onBodyPartSelect }) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [parts, setParts] = useState<BodyPart[]>([]);

    useEffect(() => {
        imageMapResize();
    }, []);

    useEffect(() => {
        drawHighlights();
    }, [parts]);

    const toggleSelection = (part: BodyPart) => {
        setParts(prev =>
            prev.some(p => p.title === part.title)
                ? prev.filter(p => p.id !== part.id)
                : [...prev, part]
        );
    };

    const handleAreaClick = (
        e: React.MouseEvent<HTMLAreaElement>,
        part: BodyPart
    ) => {
        e.preventDefault();
        toggleSelection(part);
    };

    const drawHighlights = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;

        canvas.width = img.clientWidth;
        canvas.height = img.clientHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scaleX = img.clientWidth / ORIGINAL_WIDTH;
        const scaleY = img.clientHeight / ORIGINAL_HEIGHT;

        parts.forEach(part => {
            ctx.beginPath();

            for (let i = 0; i < part.coords.length; i += 2) {
                const x = part.coords[i] * scaleX;
                const y = part.coords[i + 1] * scaleY;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.closePath();
            ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
            ctx.fill();
        });
    };

    return (
        <div className="mx-auto w-fit relative">
            <img
                ref={imgRef}
                src="body-selector.jpg"
                alt="Body Map"
                useMap="#image-map"
                className="h-auto max-h-[90vh] block"
                onLoad={drawHighlights}
            />

            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    pointerEvents: "none"
                }}
            />

            <map name="image-map">
                {bodyParts.map(part => (
                    <area
                        key={part.id}
                        shape="poly"
                        coords={part.coords.join(",")}
                        onClick={(e) => handleAreaClick(e, part)}
                        alt={part.title}
                    />
                ))}
            </map>
            <button onClick={()=>onBodyPartSelect(parts)}>done</button>
        </div>
    );
}
