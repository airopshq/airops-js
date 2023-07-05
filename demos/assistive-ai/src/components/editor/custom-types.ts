import { Descendant, BaseEditor, BaseRange, Range, Element } from 'slate'
import { ReactEditor } from 'slate-react'

export enum ElementTypes {
  Blockquote = 'block-quote',
  BulletedList = 'bulleted-list',
  HeadingOne = 'heading-one',
  HeadingTwo = 'heading-two',
  HeadingThree = 'heading-three',
  HeadingFour = 'heading-four',
  HeadingFive = 'heading-five',
  HeadingSix = 'heading-six',
  ListItem = 'list-item',
  Paragraph = 'paragraph',
}

export const SHORTCUTS: Record<string, ElementTypes> = {
  '*': ElementTypes.ListItem,
  '-': ElementTypes.ListItem,
  '+': ElementTypes.ListItem,
  '>': ElementTypes.Blockquote,
  '#': ElementTypes.HeadingOne,
  '##': ElementTypes.HeadingTwo,
  '###': ElementTypes.HeadingThree,
  '####': ElementTypes.HeadingFour,
  '#####': ElementTypes.HeadingFive,
  '######': ElementTypes.HeadingSix,
};

export type BlockQuoteElement = {
  type: ElementTypes.Blockquote;
  align?: string;
  children: Descendant[];
}

export type BulletedListElement = {
  type: ElementTypes.BulletedList;
  align?: string;
  children: Descendant[];
}

export type HeadingOneElement = {
  type: ElementTypes.HeadingOne;
  align?: string;
  children: Descendant[];
}

export type HeadingTwoElement = {
  type: ElementTypes.HeadingTwo;
  align?: string;
  children: Descendant[];
}

export type HeadingThreeElement = {
  type: ElementTypes.HeadingThree;
  align?: string;
  children: Descendant[];
}

export type HeadingFourElement = {
  type: ElementTypes.HeadingFour;
  align?: string;
  children: Descendant[];
}

export type HeadingFiveElement = {
  type: ElementTypes.HeadingFive;
  align?: string;
  children: Descendant[];
}

export type HeadingSixElement = {
  type: ElementTypes.HeadingSix;
  align?: string;
  children: Descendant[];
}

export type ListItemElement = {
  type: ElementTypes.ListItem;
  children: Descendant[];
}

export type ParagraphElement = {
  type: ElementTypes.Paragraph;
  children: Descendant[];
}

type CustomElement =
  | BlockQuoteElement
  | BulletedListElement
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement
  | HeadingFourElement
  | HeadingFiveElement
  | HeadingSixElement
  | ListItemElement
  | ParagraphElement;

export type CustomText = {
  bold?: boolean
  italic?: boolean
  code?: boolean
  text: string
}

export type EmptyText = {
  text: string
}

export type CustomEditor = BaseEditor &
  ReactEditor & {
    nodeToDecorations?: Map<Element, Range[]>
  }

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText | EmptyText
    Range: BaseRange & {
      [key: string]: unknown
    }
  }
}
