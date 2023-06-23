import { useCallback, useRef, useState } from 'react';
import AirOps from '@airops/airops-js';
import { ExecuteResponse } from '@airops/airops-js/dist/ts/types';

export enum Action {
  MakeLonger = 'make-longer',
  MakeShorter = 'make-shorter',
  ImproveWriting = 'imporve-writing',
  ConvertToSpanish = 'conver-to-spanish',
  MakeLessFormal = 'make-less-formal',
  MakeMoreFormal = 'make-more-formal',
  ConvertToPirateSpeak = 'convert-to-pirate-speak',
}

type GetAssistance = (arg: { action: Action, selection: string }) => void;

const useAssistiveAI = () => {
  const [execution, setExecution] = useState<ExecuteResponse | undefined>(undefined);
  const [result, setResult] = useState('');
  const [executing, setExecuting] = useState(false);
  const airopsInstance = useRef(new AirOps());

  const getAssistance: GetAssistance = useCallback(async ({ action, selection }) => {
    setResult('');
    setExecuting(true);

    const execution = await airopsInstance.current.apps.execute({
      appId: '923a0d82-df2c-492c-ab5e-8fa3659f14eb',
      payload: {
        inputs: {
          modification_requested: `Rewrite this text to ${action.replace('-', ' ')}`,
          passage_to_modify: selection,
        },
      },
      stream: true,
      streamCallback: (data) => {
        setResult((prevResult) => prevResult.concat(data.content));
      },
      streamCompletedCallback: () => {
        setExecuting(false);
      },
    });

    setExecution(execution);
  }, [airopsInstance]);

  const cancel = useCallback(() => {
    if (!execution) return;

    execution.cancel();
    setExecuting(false);
  }, [execution]);

  return {
    cancel,
    executing,
    getAssistance,
    result,
  };
}

export default useAssistiveAI;
