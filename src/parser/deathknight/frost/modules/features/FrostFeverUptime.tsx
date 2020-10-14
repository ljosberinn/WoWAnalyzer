import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class FrostFeverUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  suggestions(when: When) {
    const frostfeverUptime = this.enemies.getBuffUptime(SPELLS.FROST_FEVER.id) / this.owner.fightDuration;
    when(frostfeverUptime).isLessThan(0.95)
        .addSuggestion((suggest, actual, recommended) => suggest(<span>Your <SpellLink id={SPELLS.FROST_FEVER.id} /> uptime can be improved. Try to pay attention to when Frost Fever is about to fall off the priority target, using <SpellLink id={SPELLS.HOWLING_BLAST.id} /> to refresh Frost Fever. Using a debuff tracker can help.</span>)
            .icon(SPELLS.FROST_FEVER.icon)
            .actual(i18n._(t('deathknight.frost.suggestions.frostFever.uptime')`${formatPercentage(actual)}% Frost Fever uptime`))
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.05).major(recommended - 0.15));
  }

  statistic() {
    const frostfeverUptime = this.enemies.getBuffUptime(SPELLS.FROST_FEVER.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(20)}
        icon={<SpellIcon id={SPELLS.FROST_FEVER.id} />}
        value={`${formatPercentage(frostfeverUptime)} %`}
        label="Frost Fever Uptime"
      />
    );
  }
}

export default FrostFeverUptime;
