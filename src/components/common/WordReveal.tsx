import React from "react";

export function WordReveal({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <span
          className="story-word"
          data-word-index={index}
          key={`${word}-${index}`}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}
