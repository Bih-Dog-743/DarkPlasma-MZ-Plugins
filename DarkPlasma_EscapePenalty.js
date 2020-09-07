// DarkPlasma_EscapePenalty 1.0.0
// Copyright (c) 2020 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php

/**
 * 2020/08/27 1.0.0 MZ版公開
 */

/*:ja
 * @plugindesc 逃走にペナルティを与える
 * @author DarkPlasma
 * @license MIT
 *
 * @target MZ
 * @url https://github.com/elleonard/RPGtkoolMZ-Plugins
 *
 * @param loseGoldRate
 * @type number
 * @default 1
 *
 * @param loseGoldMessage
 * @desc お金を落とした際のメッセージ。{gold}は落としたお金の量、{unit}はお金の単位に変換される。
 * @text 落としたメッセージ
 * @type string
 * @default {gold}{unit}落としてしまった！
 *
 * @help
 * 逃走成功時にペナルティを与えます。
 */

(() => {
  'use strict';

  const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function () {
    return arguments[1];
  });

  const pluginParameters = PluginManager.parameters(pluginName);

  const settings = {
    loseGoldRate: Number(pluginParameters.loseGoldRate || 1),
    loseGoldMessage: String(pluginParameters.loseGoldMessage || '{gold}{unit}落としてしまった！'),
  };

  const _BattleManager_processEscape = BattleManager.processEscape;
  BattleManager.processEscape = function () {
    const success = _BattleManager_processEscape.call(this);
    if (success) {
      $gameParty.loseGoldByEscape();
    }
    return success;
  };

  Game_Party.prototype.loseGoldByEscape = function () {
    const lost = Math.floor((settings.loseGoldRate * this.gold()) / 100);
    if (lost > 0) {
      this.loseGold(lost);
      const message = settings.loseGoldMessage
        .replace('{gold}', `${lost}`)
        .replace('{unit}', `${TextManager.currencyUnit}`);
      $gameMessage.newPage();
      $gameMessage.add(message);
    }
  };
})();