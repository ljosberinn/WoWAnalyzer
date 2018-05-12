import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Abilities from 'Parser/Core/Modules/Abilities';
import DEFENSIVE_BUFFS from 'common/DEFENSIVE_BUFFS';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Tab from 'Main/Tab';
import DeathRecap from './DeathRecap';

class DeathRecapTracker extends Analyzer {

  deaths = [];
  events = [];
  healed = [];
  damaged = [];
  cooldowns = [];
  buffs = [];
  lastBuffs = [];

  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  on_initialized() {
    this.cooldowns = this.abilities.abilities.filter(e => 
      (e.category === Abilities.SPELL_CATEGORIES.DEFENSIVE || e.category === Abilities.SPELL_CATEGORIES.SEMI_DEFENSIVE) &&
      e.enabled === true
    );
    //add additional defensive buffs/debuffs to common/DEFENSIVE_BUFFS
    this.buffs = DEFENSIVE_BUFFS.concat(this.cooldowns);
  }

  addEvent(event) {
    const extendedEvent = event;
    extendedEvent.time = event.timestamp - this.owner.fight.start_time;
    extendedEvent.cooldownsAvailable = this.cooldowns.filter(e => this.spellUsable.isAvailable(e.spell.id));
    extendedEvent.cooldownsUsed = this.cooldowns.filter(e => !this.spellUsable.isAvailable(e.spell.id));
    if (event.hitPoints === 0) {
      extendedEvent.buffsUp = this.lastBuffs;
    } else {
      extendedEvent.buffsUp = this.buffs.filter(e => this.combatants.selected.hasBuff(e.spell.buffSpellId) || this.combatants.selected.hasBuff(e.spell.id));
    }
    this.lastBuffs = extendedEvent.buffsUp; //save old buffs and reuse them when all buffs got already removed
    this.events.push(extendedEvent);
  }

  on_toPlayer_heal(event) {
    this.addEvent(event);
  }

  on_toPlayer_damage(event) {  
    this.addEvent(event);
  }

  on_toPlayer_instakill(event) {
    this.addEvent(event);
  }

  on_toPlayer_death(event) {
    this.addEvent(event);
    this.deaths.push(event.timestamp);
  }

  get secondsBeforeDeath() {
    const deaths = new Array(this.deaths.length);
    this.deaths.forEach((deathtime, index) => {
      deaths[index] = {
        deathtime: deathtime,
        events: this.events,
        open: false,
      };
    });
    return deaths;
  }

  tab() {
    if (this.deaths.length > 0) {
      return {
        title: 'Death Recap',
        url: 'death-recap',
        render: () => (
          <Tab>
            <DeathRecap events={this.secondsBeforeDeath} />
          </Tab>
        ),
      };
    }
    return;
  }
}

export default DeathRecapTracker;
