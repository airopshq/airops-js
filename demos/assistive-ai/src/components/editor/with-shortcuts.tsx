import {
  Editor,
  Element as SlateElement,
  Point,
  Range,
  Transforms,
} from 'slate'
import { BulletedListElement, ElementTypes, SHORTCUTS } from './custom-types'
import { ReactEditor } from 'slate-react';

const withShortcuts = (editor: ReactEditor) => {
  const { deleteBackward, insertText } = editor

  editor.insertText = (text: string) => {
    const { selection } = editor

    if (text.endsWith(' ') && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range) + text.slice(0, -1);
      const type = SHORTCUTS[beforeText]

      if (type) {
        Transforms.select(editor, range)

        if (!Range.isCollapsed(range)) {
          Transforms.delete(editor)
        }

        const newProperties: Partial<SlateElement> = { type };
        Transforms.setNodes<SlateElement>(editor, newProperties, {
          match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
        })

        if (type === ElementTypes.ListItem) {
          const list: BulletedListElement = {
            type: ElementTypes.BulletedList,
            children: [],
          }
          Transforms.wrapNodes(editor, list, {
            match: n =>
              !Editor.isEditor(n) &&
              SlateElement.isElement(n) &&
              n.type === 'list-item',
          })
        }

        return
      }
    }

    insertText(text)
  }

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      })

      if (match) {
        const [block, path] = match
        const start = Editor.start(editor, path)

        if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          block.type !== ElementTypes.Paragraph &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties: Partial<SlateElement> = {
            type: ElementTypes.Paragraph,
          }
          Transforms.setNodes(editor, newProperties)

          if (block.type === ElementTypes.ListItem) {
            Transforms.unwrapNodes(editor, {
              match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === ElementTypes.BulletedList,
              split: true,
            })
          }

          return
        }
      }

      deleteBackward(...args)
    }
  }

  return editor
}

export default withShortcuts;
