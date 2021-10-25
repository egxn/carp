import React, { useEffect, useState } from "react";

function HandEmoji() {
  const hands = ['🤚', '🖐️', '🖖', '✌️', '🤞', '🤟', '👈', '👉', '👆', '☝️', '👍', '✊', '🤛', '🤜', '👋']
  const randomItem = (list: string[]) => list[~~(list.length * Math.random())]

  const [hand, setHand] = useState<string>(randomItem(hands));
  useEffect(() => {
    const interval = setInterval(() => {
      setHand(randomItem(hands));
    }, 3500);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="hand-emoji">
      {hand}
    </div>
  );
}

export default HandEmoji;