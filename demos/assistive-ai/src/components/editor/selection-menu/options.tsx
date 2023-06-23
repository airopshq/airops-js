import { Action } from '@/hooks/use-assistive-ai';
import { ReactComponent as ConvertToPirateSpeakIcon } from '@/assets/convert-to-pirate-speak.svg';
import { ReactComponent as ConvertToSpanishIcon } from '@/assets/convert-to-spanish.svg';
import { ReactComponent as ImproveWritingIcon } from '@/assets/improve-writing.svg';
import { ReactComponent as MakeFormalIcon } from '@/assets/make-formal.svg';
import { ReactComponent as MakeLongerIcon } from '@/assets/make-longer.svg';
import { ReactComponent as MakeShorterIcon } from '@/assets/make-shorter.svg';

const options = [
  { key: Action.MakeLonger, label: 'Make Longer', Icon: MakeLongerIcon },
  { key: Action.MakeShorter, label: 'Make Shorter', Icon: MakeShorterIcon },
  { key: Action.ImproveWriting, label: 'Improve Writing', Icon: ImproveWritingIcon },
  { key: Action.ConvertToSpanish, label: 'Convert to Spanish', Icon: ConvertToSpanishIcon },
  { key: Action.MakeLessFormal, label: 'Make Less Formal', Icon: MakeFormalIcon },
  { key: Action.MakeMoreFormal, label: 'Make More Formal', Icon: MakeFormalIcon },
  { key: Action.ConvertToPirateSpeak, label: 'Convert to Pirate Speak', Icon: ConvertToPirateSpeakIcon },
];

export default options;
