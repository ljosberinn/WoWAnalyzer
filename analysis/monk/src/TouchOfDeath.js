import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';

class TouchOfDeath extends ExecuteHelper {
  static executeSpells = [SPELLS.TOUCH_OF_DEATH];
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = 0.15;
  static executeOutsideRangeEnablers = [];
  static modifiesDamage = false;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  maxCasts = 0;

  constructor(options) {
    super(options);
    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    options.abilities.add({
      spell: SPELLS.TOUCH_OF_DEATH.id,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      cooldown: this.selectedCombatant.hasLegendaryByBonusID(SPELLS.FATAL_TOUCH.bonusID) ? 60 : 180,
      gcd:
        this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK ? { base: 1500 } : { static: 1000 },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.85,
        maxCasts: () => this.maxCasts || 0,
      },
    });
  }

  adjustMaxCasts(event) {
    super.onFightEnd(event);
    this.maxCasts += Math.ceil(this.totalExecuteDuration / this.cooldown);
  }
}

export default TouchOfDeath;
