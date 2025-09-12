import React from 'react';
import _ from 'lodash';
import { NativeModules } from 'react-native';
import { SettingsContext } from '../settings';
import { Configuration } from '../settings/settings.interface';
import ConfigBuilder from '../xmrig-config/config-builder';
import { DefaultDonationInfoProvider } from '../providers';

const { XMRigForAndroid } = NativeModules;

export interface IMinerSendCompiguration {
  id: string,
  name: string,
  mode: string,
  xmrig_fork: string,
  config: string,
}

export const useMiner = () => {
  const { settings } = React.useContext(SettingsContext);

  // TODO PHASE2: Replace with PolicyOrchestrator injection for adaptive donation
  const donationProvider = React.useMemo(
    () => new DefaultDonationInfoProvider(settings),
    [settings],
  );

  const startHandler = React.useCallback((config: IMinerSendCompiguration) => {
    XMRigForAndroid.start(JSON.stringify(config));
  }, []);

  const startWithSelectedConfigurationHandler = React.useCallback(() => {
    if (settings.selectedConfiguration) {
      const cConfig:Configuration | undefined = settings.configurations.find(
        (config) => config.id === settings.selectedConfiguration,
      );

      if (cConfig) {
        const sConfig = ConfigBuilder.build(cConfig);
        if (sConfig) {
          const sConfigPartial: Partial<IMinerSendCompiguration> = _.pick(
            cConfig,
            ['id', 'name', 'mode', 'xmrig_fork'],
          );
          sConfig.setProps({
            'donate-level': donationProvider.getDonationPercent(),
            'print-time': settings.printTime,
          });

          startHandler({
            ...sConfigPartial,
            config: sConfig.getConfigBase64(),
          } as IMinerSendCompiguration);
        }
      }
    }
  }, [settings, donationProvider, startHandler]);

  const stopHandler = React.useCallback(() => {
    XMRigForAndroid.stop();
  }, []);

  return {
    start: startHandler,
    startWithSelectedConfiguration: startWithSelectedConfigurationHandler,
    stop: stopHandler,
  };
};
