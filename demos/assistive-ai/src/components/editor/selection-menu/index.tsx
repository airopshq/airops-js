import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cn from 'classnames';
import { Editor, Range, Transforms } from 'slate'
import { useSlate } from 'slate-react'

import options from './options';
import Button from "@/components/button";
import PulseLoader from "@/components/pulse-loader";
import useAssistiveAI, { Action } from "@/hooks/use-assistive-ai";

type SelectionMenuProps = {
  maxWidth?: string | number;
};

const SelectionMenu = ({ maxWidth = '100%' }: SelectionMenuProps) => {
  const wrapperRef = useRef<HTMLElement>(document.getElementById('assistive-ai-demo') as HTMLElement);
  const ref = useRef<HTMLDivElement | null>(null);
  const editor = useSlate();
  const [action, setAction] = useState<Action | undefined>(undefined);
  const { cancel, executing, getAssistance, result } = useAssistiveAI();

  useEffect(() => {
    const el = ref.current
    const { selection } = editor

    if (!el) {
      setAction(undefined);
      return;
    }

    if (
      !selection ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      setAction(undefined);
      el.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection) return;

    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    const wrapperRect = wrapperRef.current.getBoundingClientRect();

    el.style.opacity = '1';
    el.style.top = `${rect.bottom - wrapperRect.y}px`;
    el.style.left = `${rect.left - wrapperRect.left}px`;
    el.style.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
  });

  const handleSelectAction = (action: Action) => {
    const el = ref.current
    const selection = window.getSelection();

    if (!el || !selection) return;

    setAction(action);
    getAssistance({ action, selection: selection.toString() });
  }

  const acceptChanges = () => {
    const el = ref.current
    const { selection } = editor

    if (!el || !selection) return;

    Transforms.delete(editor, { at: selection });
    Transforms.insertText(editor, result, { at: selection.anchor });
    el.removeAttribute('style');
  }

  return (
    createPortal(
      <div
        ref={ref}
        className={cn("selection-menu", { "selection-menu--full": action })}
        onClick={(ev) => ev.preventDefault()}
      >
        <div className="menu menu--options">
          {options.map((option) => (
            <button
              key={option.key}
              className="menu__option"
              disabled={executing}
              onClick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                handleSelectAction(option.key);
              }}
            >
              <option.Icon />
              {option.label}
            </button>
          ))}
        </div>
        <div className={cn("menu menu--action", { "menu--hidden": !action })}>
          <div className="menu__content">
            {result}
            {executing && <span className='menu__cursor'>|</span>}
          </div>
          <div className={cn("menu__footer", { "menu__footer--end": !executing })}>
            {executing ? (
              <>
                <PulseLoader label="Generating new content" />

                <Button onClick={cancel}>
                  Stop
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => action && handleSelectAction(action)}>
                  Try Again
                </Button>
                <Button onClick={acceptChanges}>
                  Accept Changes
                </Button>
              </>
            )}
          </div>
        </div>
      </div>,
      document.getElementById('assistive-ai-demo') as HTMLElement,
    )
  );
}

export default SelectionMenu;
