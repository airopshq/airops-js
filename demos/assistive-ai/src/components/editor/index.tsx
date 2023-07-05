import { useCallback, useMemo } from 'react'
import { useMeasure } from 'react-use';
import {
  createEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Node as SlateNode,
} from 'slate'
import { Editable, ReactEditor, Slate, withReact } from 'slate-react'

import Element, { ElementProps } from './element';
import SelectionMenu from './selection-menu';
import withShortcuts from './with-shortcuts';
import { ElementTypes, SHORTCUTS } from './custom-types';
import './index.scss';

const initialValue: Descendant[] = [
  {
    type: ElementTypes.HeadingThree,
    children: [{ text: 'Introducing Apple AirPods, the ultimate wireless audio experience.' }],
  },
  {
    type: ElementTypes.Paragraph,
    children: [
      {
        text: "Discover the true freedom of wireless audio with Apple AirPods. These stylish and cutting-edge earbuds deliver unparalleled sound quality, effortless connectivity, and a seamless user experience. Say goodbye to tangled wires and hello to a world of wireless convenience. Immerse yourself in your favorite music, take calls with clarity, and enjoy the flexibility of AirPods' intuitive controls.",
      },
    ],
  },
  {
    type: ElementTypes.Paragraph,
    children: [
      {
        text: 'With a sleek design, comfortable fit, and long battery life, Apple AirPods are the perfect companion for your everyday audio needs. Upgrade your listening experience and embrace the future of wireless audio with Apple AirPods.',
      },
    ],
  },
];

const HoveringMenuExample = () => {
  const [editorRef, { width }] = useMeasure<HTMLDivElement>();
  const renderElement = useCallback((props: ElementProps) => <Element {...props} />, []);
  const editor = useMemo(
    () => withShortcuts(withReact(createEditor())),
    []
  )

  const handleDOMBeforeInput = useCallback(() => {
    queueMicrotask(() => {
      const pendingDiffs = ReactEditor.androidPendingDiffs(editor);

      const scheduleFlush = pendingDiffs?.some(({ diff, path }) => {
        if (!diff.text.endsWith(' ')) return false;

        const { text } = SlateNode.leaf(editor, path);
        const beforeText = text.slice(0, diff.start) + diff.text.slice(0, -1);
        if (!(beforeText in SHORTCUTS)) return;

        const blockEntry = Editor.above(editor, {
          at: path,
          match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
        });
        if (!blockEntry) return false;

        const [, blockPath] = blockEntry;
        return Editor.isStart(editor, Editor.start(editor, path), blockPath);
      })

      if (scheduleFlush) {
        ReactEditor.androidScheduleFlush(editor);
      }
    })
  }, [editor]);

  return (
    <div className='editor' ref={editorRef}>
      <Slate
        editor={editor}
        initialValue={initialValue}
      >
        <SelectionMenu maxWidth={width} />

        <Editable
          onDOMBeforeInput={handleDOMBeforeInput}
          renderElement={renderElement}
          placeholder="Write some markdown..."
          spellCheck
          autoFocus
        />
      </Slate>
    </div>
  )
}

export default HoveringMenuExample

