import { useEffect, useRef } from "react";
import { cn } from "../../utils/cn";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const delayedCursor = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId: number;

    const updateMousePosition = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const renderCursor = () => {
      delayedCursor.current.x +=
        (mouse.current.x - delayedCursor.current.x) * 0.25;
      delayedCursor.current.y +=
        (mouse.current.y - delayedCursor.current.y) * 0.25;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${delayedCursor.current.x}px, ${delayedCursor.current.y}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(renderCursor);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        cursorRef.current &&
        (target.tagName.toLowerCase() === "button" ||
          target.tagName.toLowerCase() === "a" ||
          target.closest("button") ||
          target.closest("a"))
      ) {
        cursorRef.current.classList.add("cursor-hover");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        cursorRef.current &&
        (target.tagName.toLowerCase() === "button" ||
          target.tagName.toLowerCase() === "a" ||
          target.closest("button") ||
          target.closest("a"))
      ) {
        cursorRef.current.classList.remove("cursor-hover");
      }
    };

    const handleMouseDown = () => {
      if (cursorRef.current) cursorRef.current.classList.add("cursor-active");
    };

    const handleMouseUp = () => {
      if (cursorRef.current)
        cursorRef.current.classList.remove("cursor-active");
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    renderCursor();

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={cn(
        "fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference rounded-full flex items-center justify-center will-change-transform",
        "w-6 h-6 bg-transparent border border-accent-primary",
        "[&.cursor-hover]:w-16 [&.cursor-hover]:h-16 [&.cursor-hover]:bg-white [&.cursor-hover]:border-transparent",
        "[&.cursor-active]:w-4 [&.cursor-active]:h-4 [&.cursor-active]:bg-accent-primary [&.cursor-active]:scale-75",
        "transition-[width,height,background-color,border-color] duration-150 ease-out",
      )}
      aria-hidden="true"
    />
  );
}