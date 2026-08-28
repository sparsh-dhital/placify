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
      // INCREASED SPEED: Changed from 0.15 to 0.40.
      // This makes the cursor catch up faster, feeling much snappier
      // while still keeping a tiny bit of premium smoothness.
      delayedCursor.current.x +=
        (mouse.current.x - delayedCursor.current.x) * 0.4;
      delayedCursor.current.y +=
        (mouse.current.y - delayedCursor.current.y) * 0.4;

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
        "w-3 h-3 bg-white",
        "[&.cursor-hover]:scale-150",
        "[&.cursor-active]:scale-75",
        "transition-transform duration-150 ease-out",
      )}
      aria-hidden="true"
    />
  );
}
