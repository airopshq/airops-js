import { ElementTypes } from './custom-types';

export type ElementProps = {
  attributes: Record<any, any>;
  children: React.ReactNode;
  element: {
    type: ElementTypes;
    [key: string]: any;
  };
};

const Element = ({ attributes, children, element }: ElementProps) => {
  switch (element.type) {
    case ElementTypes.Blockquote:
      return <blockquote {...attributes}>{children}</blockquote>
    case ElementTypes.BulletedList:
      return <ul {...attributes}>{children}</ul>
    case ElementTypes.HeadingOne:
      return <h1 {...attributes}>{children}</h1>
    case ElementTypes.HeadingTwo:
      return <h2 {...attributes}>{children}</h2>
    case ElementTypes.HeadingThree:
      return <h3 {...attributes}>{children}</h3>
    case ElementTypes.HeadingFour:
      return <h4 {...attributes}>{children}</h4>
    case ElementTypes.HeadingFive:
      return <h5 {...attributes}>{children}</h5>
    case ElementTypes.HeadingSix:
      return <h6 {...attributes}>{children}</h6>
    case ElementTypes.ListItem:
      return <li {...attributes}>{children}</li>
    default:
      return <p {...attributes}>{children}</p>
  }
}

export default Element;
