import { Children, cloneElement, isValidElement } from 'react';

// Splits a heading into masked words that slide up one after another when it scrolls
// into view (floema.com's line/word reveal). Works with nested elements such as
// <br /> and <span className="accent">. The reveal itself is driven by motion/reveal.js.
export default function SplitText({ as: Tag = 'span', className = '', children, ...rest }) {
  let index = 0;
  const walk = (node) =>
    Children.map(node, (child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child)
          .split(/(\s+)/)
          .filter(Boolean)
          .map((part, k) =>
            /^\s+$/.test(part) ? ' ' : (
              <span className="w" key={k}>
                <span className="wi" style={{ '--i': index++ }}>{part}</span>
              </span>
            ),
          );
      }
      if (isValidElement(child) && child.props.children !== undefined) {
        return cloneElement(child, undefined, walk(child.props.children));
      }
      return child;
    });

  return (
    <Tag className={`split ${className}`.trim()} {...rest}>
      {walk(children)}
    </Tag>
  );
}
