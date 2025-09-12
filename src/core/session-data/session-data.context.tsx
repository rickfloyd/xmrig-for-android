import React from 'react';
import { Incubator } from 'react-native-ui-lib';
import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';
import { useHashrateHistory } from '../hooks';
import {
  StartMode, IXMRigLogEvent, WorkingState, IHashrateHistory,
} from './session-data.interface';
import { SettingsActionType, SettingsContext } from '../settings';
import { cleanAnsiLogLineRegex, filterLogLineRegex } from '../utils/parsers';
import { Configuration, ConfigurationMode, ISimpleConfiguration } from '../settings/settings.interface';
import { LoggerContext } from '../logger';
import { PowerContext } from '../power/power.context';
import { IMinerSummary, useMinerSummary } from '../hooks/use-miner-summary.hook';
import { useMinerStatus } from '../hooks/use-miner-status.hook';
import { useThermal } from '../hooks/use-thermal.hook';
import { useToaster } from '../hooks/use-toaster/use-toaster.hook';

const { XMRigForAndroid } = NativeModules;

type SessionDataContextType = {
  working: StartMode,
  workingState: string,
  minerData: IMinerSummary | null,
  hashrateTotals: IHashrateHistory,
  minerActions: {
    pause: () => {},
    resume: () => {},
  },
  CPUTemp: number,
}

// @ts-ignore
export const SessionDataContext:React.Context<SessionDataContextType> = React.createContext();

export const SessionDataContextProvider:React.FC = ({ children }) => {
  const toaster = useToaster();
  const { settings, settingsDispatcher } = React.useContext(SettingsContext);
  const { log } = React.useContext(LoggerContext);
  const { isLowBattery, isPowerConnected } = React.useContext(PowerContext);

  const hashrateHistory = useHashrateHistory([0, 0]);
  const hashrateHistory10s = useHashrateHistory([0, 0]);
  const hashrateHistory60s = useHashrateHistory([0, 0]);
  const hashrateHistory15m = useHashrateHistory([0, 0]);
  const hashrateHistoryMax = useHashrateHistory([0, 0]);

  const [workingState, setWorkingState] = React.useState<WorkingState>(WorkingState.NOT_WORKING);
  const { minerData } = useMinerSummary();
  const { isWorking } = useMinerStatus();
  const { cpuTemperature } = useThermal();

  // backward compability
  const working = React.useMemo<StartMode>(
    () => {
      if (isWorking === true) {
        return StartMode.START;
      }
      return StartMode.STOP;
    },
    [isWorking],
  );

  const pauseMiner = () => XMRigForAndroid?.pauseMiner();
  const resumeMiner = () => XMRigForAndroid?.resumeMiner();

  React.useEffect(() => {
    hashrateHistory.add(parseFloat(`${minerData?.hashrate.total[0]}`) || 0);
    hashrateHistory10s.add(parseFloat(`${minerData?.hashrate.total[0]}`) || 0);
    hashrateHistory60s.add(parseFloat(`${minerData?.hashrate.total[1]}`) || 0);
    hashrateHistory15m.add(parseFloat(`${minerData?.hashrate.total[2]}`) || 0);
    hashrateHistoryMax.add(parseFloat(`${minerData?.hashrate.highest}`) || 0);
  }, [minerData]);

  React.useEffect(() => {
    if (!isWorking) {
      setWorkingState(WorkingState.NOT_WORKING);
      hashrateHistory.reset();
      hashrateHistory10s.reset();
      hashrateHistory60s.reset();
      hashrateHistory15m.reset();
      hashrateHistoryMax.reset();
    } else if (isWorking && minerData?.paused) {
      setWorkingState(WorkingState.PAUSED);
    } else if (isWorking && !minerData?.paused) {
      setWorkingState(WorkingState.MINING);
    }
  }, [isWorking, minerData?.paused]);

  React.useEffect(() => {
    const MinerEmitter = new NativeEventEmitter(XMRigForAndroid);

    const onLogSub:EmitterSubscription = MinerEmitter.addListener('onLog', (data:IXMRigLogEvent) => {
      const cleanData = [...data.log.filter((item) => !filterLogLineRegex.test(item))];
      cleanData.forEach((itemLog) => log(itemLog.replace(cleanAnsiLogLineRegex, '$2').toString()));
    });

    const onConfigUpdateSub:EmitterSubscription = MinerEmitter.addListener('onConfigUpdate', (data) => {
      console.log('onConfigUpdate', data.config);
      const cConfig:Configuration | undefined = settings.configurations.find(
        (config) => config.id === settings.selectedConfiguration,
      );
      if (cConfig && cConfig.mode === ConfigurationMode.SIMPLE) {
        try {
          const parsedConfig = JSON.parse(data.config);
          console.log('parsedConfig', parsedConfig);
          settingsDispatcher({
            type: SettingsActionType.UPDATE_CONFIGURATION,
            value: {
              ...cConfig,
              properties: {
                ...(cConfig as ISimpleConfiguration).properties,
                algo_perf: parsedConfig['algo-perf'],
              },
            },
          });
        } catch (e) {
          console.log('ERROR PARSE ALGO PERF', e);
        }
      }
      if (cConfig && cConfig.mode === ConfigurationMode.ADVANCE) {
        settingsDispatcher({
          type: SettingsActionType.UPDATE_CONFIGURATION,
          value: {
            ...cConfig,
            config: data.config,
          },
        });
      }
    });

    return () => {
      onLogSub.remove();
      onConfigUpdateSub.remove();
      XMRigForAndroid.stop();
    };
  }, []);

  React.useEffect(() => {
    if (isLowBattery) {
      toaster({
        message: 'Battery is low',
        position: 'top',
        preset: Incubator.ToastPresets.FAILURE,
      });
    }
    if (settings.power.pauseOnLowBattery && isLowBattery === true) {
      // TODO PHASE2: Hook PolicyOrchestrator for battery pause policy
      pauseMiner();
    } else if (settings.power.resumeOnBatteryOk && isLowBattery === false) {
      resumeMiner();
    }
  }, [isLowBattery]);

  React.useEffect(() => {
    if (!isPowerConnected) {
      toaster({
        message: 'Charger is disconnected',
        position: 'top',
        preset: Incubator.ToastPresets.FAILURE,
      });
    } else {
      toaster({
        message: 'Charger is connected',
        position: 'top',
        preset: Incubator.ToastPresets.SUCCESS,
      });
    }
    if (
      settings.power.resumeOnChargerConnected
      && isPowerConnected === true
      && workingState === WorkingState.PAUSED) {
      resumeMiner();
    } else if (
      settings.power.pauseOnChargerDisconnected
      && isPowerConnected === false
      && workingState === WorkingState.MINING
    ) {
      pauseMiner();
    }
  }, [isPowerConnected]);

  React.useEffect(() => {
    if (!Number.isNaN(cpuTemperature)) {
      if (
        settings.thermal.pauseOnCPUTemperatureOverHeat
        && cpuTemperature > settings.thermal.pauseOnCPUTemperatureOverHeatValue
        && workingState === WorkingState.MINING
      ) {
        // TODO PHASE2: Hook PolicyOrchestrator for thermal throttle policy
        pauseMiner();
      } else if (
        settings.thermal.resumeCPUTemperatureNormal
        && cpuTemperature < settings.thermal.resumeCPUTemperatureNormalValue
        && workingState === WorkingState.PAUSED
      ) {
        resumeMiner();
      }
    }
  }, [cpuTemperature]);

  // TODO PHASE2: Add AppState listener for background/foreground events
  // React.useEffect(() => {
  //   const handleAppStateChange = (nextAppState: string) => {
  //     if (nextAppState === 'background') {
  //       Log.d('SessionData', 'App moved to background');
  //       // Hook PolicyOrchestrator for background mining policy
  //     }
  //   };
  //   AppState.addEventListener('change', handleAppStateChange);
  //   return () => AppState.removeEventListener('change', handleAppStateChange);
  // }, []);

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <SessionDataContext.Provider value={{
      working,
      workingState,
      minerData,
      hashrateTotals: {
        historyCurrent: hashrateHistory.history,
        history10s: hashrateHistory10s.history,
        history60s: hashrateHistory60s.history,
        history15m: hashrateHistory15m.history,
        historyMax: hashrateHistoryMax.history,
      },
      minerActions: {
        pause: pauseMiner,
        resume: resumeMiner,
      },
      CPUTemp: cpuTemperature,
    }}
    >
      {children}
    </SessionDataContext.Provider>
  );
};
