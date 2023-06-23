declare module '*.svg' {
  import React from 'react';

  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;

  export { SVG as ReactComponent };
  export default SVG;
}
